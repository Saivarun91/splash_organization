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
  // Auth (for compatibility)
  login: (email, password) =>
    apiRequest("/api/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
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
  removeUser: (organizationId, userId) =>
    apiRequest(`/api/organizations/${organizationId}/users/${userId}/remove/`, {
      method: "DELETE",
    }),
  // User API functions
  getUserBySlug: (organizationId, userSlug) =>
    apiRequest(`/api/organizations/${organizationId}/users/${userSlug}/`),
  getUserImages: (organizationId, userSlug, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/api/organizations/${organizationId}/users/${userSlug}/images/?${queryParams}`);
  },
  getUserProjects: (organizationId, userSlug) =>
    apiRequest(`/api/organizations/${organizationId}/users/${userSlug}/projects/`),
  getUserCreditHistory: (organizationId, userSlug, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/api/organizations/${organizationId}/users/${userSlug}/credit-history/?${queryParams}`);
  },
  // Project API functions (supports both ID and slug)
  getProject: (projectIdOrSlug) =>
    apiRequest(`/probackendapp/api/projects/${projectIdOrSlug}/`),
  getUserRole: (projectIdOrSlug) =>
    apiRequest(`/probackendapp/api/projects/${projectIdOrSlug}/user-role/`),
  updateProject: (projectIdOrSlug, data) =>
    apiRequest(`/probackendapp/api/projects/${projectIdOrSlug}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateProjectStatus: (projectIdOrSlug, status) =>
    apiRequest(`/probackendapp/api/projects/${projectIdOrSlug}/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteProject: (projectIdOrSlug) =>
    apiRequest(`/probackendapp/api/projects/${projectIdOrSlug}/`, {
      method: "DELETE",
    }),
  // Project collaboration API functions
  listInvites: (projectIdOrSlug) =>
    apiRequest(`/probackendapp/api/projects/${projectIdOrSlug}/invites/`),
  inviteUser: (projectIdOrSlug, email, role) =>
    apiRequest(`/probackendapp/api/projects/${projectIdOrSlug}/invite/`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),
  updateMemberRole: (projectIdOrSlug, memberId, role) =>
    apiRequest(`/probackendapp/api/projects/${projectIdOrSlug}/members/${memberId}/`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  // Collection API functions
  getCollection: (collectionId) =>
    apiRequest(`/probackendapp/api/collections/${collectionId}/`),
  updateCollectionDescription: (projectId, description, uploadedImage = null, targetAudience = null, campaignSeason = null) => {
    if (uploadedImage) {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('uploaded_image', uploadedImage);
      if (targetAudience) formData.append('target_audience', targetAudience);
      if (campaignSeason) formData.append('campaign_season', campaignSeason);
      
      const url = `${API_BASE_URL}/probackendapp/api/projects/${projectId}/setup/description/`;
      const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
      
      return fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }).then(response => response.json());
    }
    
    const requestData = { description };
    if (targetAudience) requestData.target_audience = targetAudience;
    if (campaignSeason) requestData.campaign_season = campaignSeason;
    
    return apiRequest(`/probackendapp/api/projects/${projectId}/setup/description/`, {
      method: "POST",
      body: JSON.stringify(requestData),
    });
  },
  updateCollectionSelections: (projectId, collectionId, selections, uploadedImages = {}) => {
    if (Object.keys(uploadedImages).some(category => uploadedImages[category]?.length > 0)) {
      const formData = new FormData();
      formData.append('selections', JSON.stringify(selections));
      
      Object.keys(uploadedImages).forEach(category => {
        uploadedImages[category].forEach((image) => {
          formData.append(`uploaded_${category}_images`, image.file || image);
        });
      });
      
      const url = `${API_BASE_URL}/probackendapp/api/projects/${projectId}/collections/${collectionId}/selections/`;
      const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
      
      return fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }).then(response => response.json());
    }
    
    return apiRequest(`/probackendapp/api/projects/${projectId}/collections/${collectionId}/selections/`, {
      method: "POST",
      body: JSON.stringify({ selections }),
    });
  },
  selectModel: (collectionId, modelType, modelData) =>
    apiRequest(`/probackendapp/api/collections/${collectionId}/select-model/`, {
      method: "POST",
      body: JSON.stringify({ type: modelType, model: modelData }),
    }),
  getAvailableUsers: (projectIdOrSlug) =>
    apiRequest(`/probackendapp/api/projects/${projectIdOrSlug}/available-users/`),
  getModelUsageStats: (collectionId) =>
    apiRequest(`/probackendapp/api/collections/${collectionId}/model-usage-stats/`),
  getCollectionHistory: (collectionId) =>
    apiRequest(`/probackendapp/api/collections/${collectionId}/history/`),
  getAllModels: (collectionId) =>
    apiRequest(`/probackendapp/api/collections/${collectionId}/models/`),
  regenerateProductModelImage: (collectionId, productImagePath, generatedImagePath, prompt, useDifferentModel = false, newModel = null) => {
    const url = `${API_BASE_URL}/probackendapp/api/collections/${collectionId}/regenerate-product-model-image/`;
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    
    const formData = new FormData();
    formData.append('product_image_path', productImagePath);
    formData.append('generated_image_path', generatedImagePath);
    formData.append('prompt', prompt);
    formData.append('use_different_model', useDifferentModel);
    if (newModel) {
      formData.append('new_model', JSON.stringify(newModel));
    }
    
    return fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }).then(response => response.json());
  },
  enhanceImage: (imageUrl, collectionId, productImagePath, generatedImagePath) => {
    const url = `${API_BASE_URL}/probackendapp/api/collections/${collectionId}/enhance-image/`;
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('product_image_path', productImagePath);
    formData.append('generated_image_path', generatedImagePath);
    
    return fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }).then(response => response.json());
  },
  generateProductModelImages: (collectionId, imageTypeSelections = null) => {
    const body = imageTypeSelections ? { image_type_selections: imageTypeSelections } : {};
    return apiRequest(`/probackendapp/api/collections/${collectionId}/generate-all-product-model-images/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  getJobImages: (jobId) =>
    apiRequest(`/probackendapp/api/jobs/${jobId}/images/`),
  getTaskStatus: (taskId) =>
    apiRequest(`/probackendapp/api/task-status/${taskId}/`),
  generateProductModelImagesWithPolling: async (collectionId, imageTypeSelections = null, onProgress = null) => {
    const startResponse = await organizationAPI.generateProductModelImages(collectionId, imageTypeSelections);

    if (!startResponse.success || !startResponse.job_id) {
      throw new Error(startResponse.error || 'Failed to start image generation job');
    }

    const jobId = startResponse.job_id;

    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const jobStatus = await organizationAPI.getJobImages(jobId);

          if (onProgress) {
            onProgress(jobStatus);
          }

          if (jobStatus.status === 'completed') {
            clearInterval(pollInterval);
            resolve({
              success: true,
              message: jobStatus.message || 'Image generation completed',
              total_generated: jobStatus.completed_images,
              job_id: jobId,
            });
          } else if (jobStatus.status === 'failed') {
            clearInterval(pollInterval);
            const errorMsg = jobStatus.error || 'Image generation job failed';
            reject(new Error(errorMsg));
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 2000);

      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Job timeout: Image generation took too long'));
      }, 600000);
    });
  },
  uploadWorkflowImage: (projectId, collectionId, category, images) => {
    const url = `${API_BASE_URL}/probackendapp/api/projects/${projectId}/collections/${collectionId}/upload-workflow-image/`;
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    
    const formData = new FormData();
    formData.append('category', category);
    for (const image of images) {
      formData.append('images', image);
    }
    
    return fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }).then(response => response.json());
  },
  removeWorkflowImage: (projectId, collectionId, imageId, category, cloudUrl = null) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    return apiRequest(`/probackendapp/api/projects/${projectId}/collections/${collectionId}/remove-workflow-image/`, {
      method: "DELETE",
      body: JSON.stringify({
        image_id: imageId,
        cloud_url: cloudUrl,
        category: category
      }),
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
  generateAIImages: async (collectionId, onProgress = null) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    const startResponse = await apiRequest(`/probackendapp/api/collections/${collectionId}/generate-images/`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!startResponse.success || !startResponse.task_id) {
      throw new Error(startResponse.error || 'Failed to start AI image generation');
    }

    const taskId = startResponse.task_id;

    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await organizationAPI.getTaskStatus(taskId);
          if (onProgress) {
            onProgress(statusResponse);
          }
          if (statusResponse.status === 'completed') {
            clearInterval(pollInterval);
            resolve(statusResponse);
          } else if (statusResponse.status === 'failed') {
            clearInterval(pollInterval);
            reject(new Error(statusResponse.error || 'AI image generation failed'));
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 2000);

      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Task timeout: AI image generation took too long'));
      }, 300000);
    });
  },
  saveGeneratedImages: (collectionId, selectedImages) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    return apiRequest(`/probackendapp/api/collections/${collectionId}/save-images/`, {
      method: "POST",
      body: JSON.stringify({ images: selectedImages }),
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
  uploadRealModels: (collectionId, images) => {
    const url = `${API_BASE_URL}/probackendapp/api/collections/${collectionId}/upload-real-models/`;
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    
    const formData = new FormData();
    for (const image of images) {
      formData.append('images', image);
    }
    
    return fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }).then(response => response.json());
  },
  removeModel: (collectionId, type, model) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    return apiRequest(`/probackendapp/api/collections/${collectionId}/models/`, {
      method: "DELETE",
      body: JSON.stringify({ type, model }),
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
  getCreditSettings: () => apiRequest('/api/credits/settings/'),
  uploadProductImages: (collectionId, images, ornamentTypes) => {
    const url = `${API_BASE_URL}/probackendapp/api/collections/${collectionId}/upload-products/`;
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    
    const formData = new FormData();
    for (const image of images) {
      formData.append('images', image);
    }
    if (ornamentTypes && ornamentTypes.length > 0) {
      formData.append('ornament_types', JSON.stringify(ornamentTypes));
    }
    
    return fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }).then(response => response.json());
  },
  deleteProductImage: (collectionId, productImageUrl, productImagePath) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    return apiRequest(`/probackendapp/api/collections/${collectionId}/products/`, {
      method: "DELETE",
      body: JSON.stringify({
        product_image_url: productImageUrl,
        product_image_path: productImagePath
      }),
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
  updateProductGenerationSelections: (collectionId, imageTypeSelections) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    return apiRequest(`/probackendapp/api/collections/${collectionId}/products/generation-selections/`, {
      method: "PUT",
      body: JSON.stringify({
        image_type_selections: imageTypeSelections
      }),
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
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
  createRazorpayOrder: (
    organizationId,
    amount,
    credits,
    planId = null,
    billingDetails = {}
  ) =>
    apiRequest("/api/payments/razorpay/create-order/", {
      method: "POST",
      body: JSON.stringify({
        organization_id: organizationId,
        amount,
        credits,
        plan_id: planId,
        ...billingDetails,
      }),
    }),
  verifyPayment: (orderId, paymentId, signature) =>
    apiRequest("/api/payments/razorpay/verify/", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId, payment_id: paymentId, signature }),
    }),
  getPaymentHistory: (organizationId) =>
    apiRequest(`/api/payments/history/?organization_id=${organizationId}`),
  submitContactSales: (data) =>
    apiRequest("/api/payments/contact-sales/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/**
 * Invoice API functions
 */
export const invoiceAPI = {
  getInvoice: (transactionId) =>
    apiRequest(`/api/invoices/${transactionId}/`),
  getConfig: () =>
    apiRequest(`/api/invoices/config/`),
  downloadInvoice: (transactionId) => {
    const url = `${API_BASE_URL}/api/invoices/${transactionId}/download/`;
    const token = typeof window !== "undefined" ? localStorage.getItem("org_auth_token") : null;
    
    return fetch(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }).then((response) => {
      if (!response.ok) throw new Error("Failed to download invoice");
      return response.blob();
    });
  },
};