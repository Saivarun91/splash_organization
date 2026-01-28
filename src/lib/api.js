/**
 * API utility functions for organization portal
 * Connects to the backend Django API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * Generic API fetch function with authentication
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add authentication token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("org_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("org_auth_token");
        localStorage.removeItem("org_user");
        localStorage.removeItem("org_user_id");
        localStorage.removeItem("org_organization_id");
        window.location.href = "/login";
      }
      throw new Error("Authentication failed. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

/**
 * Authentication API functions
 */
export const authAPI = {
  login: (email, password) =>
    apiRequest("/api/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getProfile: () => apiRequest("/api/profile/"),
  updateUserProfile: (data) =>
    apiRequest("/api/profile/update/", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

/**
 * Organization API functions
 */
export const organizationAPI = {
  getOrganization: (organizationId) => apiRequest(`/api/organizations/${organizationId}/`),
  getOrganizationImages: (organizationId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/api/organizations/${organizationId}/images/?${queryParams}`);
  },
  getOrganizationCreditUsage: (organizationId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/api/credits/organization/${organizationId}/usage/?${queryParams}`);
  },
  getOrganizationMembers: (organizationId) =>
    apiRequest(`/api/organizations/${organizationId}/members/`),
  getOrganizationStats: (organizationId) =>
    apiRequest(`/api/organizations/${organizationId}/stats/`),
  addUser: (organizationId, email, role) =>
    apiRequest(`/api/organizations/${organizationId}/add-user/`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),
};

/**
 * Plans API functions
 */
export const plansAPI = {
  getAll: (activeOnly = true) => {
    const params = activeOnly ? '?active_only=true' : '';
    return apiRequest(`/api/plans/${params}`);
  },
  getById: (planId) => apiRequest(`/api/plans/${planId}/`),
};

/**
 * Payment API functions
 */
export const paymentAPI = {
  createRazorpayOrder: (organizationId, amount, credits, planId = null) =>
    apiRequest("/api/payments/razorpay/create-order/", {
      method: "POST",
      body: JSON.stringify({ 
        organization_id: organizationId, 
        amount, 
        credits,
        plan_id: planId 
      }),
    }),
  verifyPayment: (orderId, paymentId, signature) =>
    apiRequest("/api/payments/razorpay/verify/", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId, payment_id: paymentId, signature }),
    }),
  getPaymentHistory: (organizationId) =>
    apiRequest(`/api/payments/history/?organization_id=${organizationId}`),
};
