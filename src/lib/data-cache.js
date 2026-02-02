/**
 * Client-side data cache for instant navigation
 * Prevents duplicate API calls and enables instant data access
 */

class DataCache {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
        this.maxAge = 5 * 60 * 1000; // 5 minutes default
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const age = Date.now() - cached.timestamp;
        if (age > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    set(key, data, maxAge = this.maxAge) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            maxAge
        });
    }

    invalidate(key) {
        this.cache.delete(key);
    }

    invalidatePattern(pattern) {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    clear() {
        this.cache.clear();
        this.pendingRequests.clear();
    }

    async getOrFetch(key, fetchFn, maxAge = this.maxAge) {
        const cached = this.get(key);
        if (cached) {
            return cached;
        }

        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key);
        }

        const promise = fetchFn()
            .then(data => {
                this.set(key, data, maxAge);
                this.pendingRequests.delete(key);
                return data;
            })
            .catch(error => {
                this.pendingRequests.delete(key);
                throw error;
            });

        this.pendingRequests.set(key, promise);
        return promise;
    }
}

export const dataCache = new DataCache();

export const cacheKeys = {
    collection: (id) => `collection:${id}`,
    collectionHistory: (id) => `collection:${id}:history`,
    modelStats: (id) => `collection:${id}:model-stats`,
};
