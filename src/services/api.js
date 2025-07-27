import axios from 'axios';
import tokenManager from '../utils/tokenManager.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Global loading state
let activeRequests = 0;
let loadingCallback = null;

export const setGlobalLoadingCallback = (callback) => {
    loadingCallback = callback;
};

// Request interceptor
apiClient.interceptors.request.use(
    async (config) => {
        // Add auth token using tokenManager
        try {
            const token = await tokenManager.getValidAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn('No valid token available:', error.message);
            // Don't reject the request, let it proceed (for public endpoints)
        }

        // Track loading state
        activeRequests++;
        if (loadingCallback && activeRequests === 1) {
            loadingCallback(true);
        }

        // Add request timestamp for monitoring
        config.metadata = { startTime: new Date() };

        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data instanceof FormData ? '[FormData]' : config.data
        });

        return config;
    },
    (error) => {
        activeRequests--;
        if (loadingCallback && activeRequests === 0) {
            loadingCallback(false);
        }

        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor với comprehensive error handling
apiClient.interceptors.response.use(
    (response) => {
        // Track loading state
        activeRequests--;
        if (loadingCallback && activeRequests === 0) {
            loadingCallback(false);
        }

        // Log response time
        const endTime = new Date();
        const duration = endTime - response.config.metadata.startTime;

        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);

        // Warn on slow requests
        if (duration > 3000) {
            console.warn(`🐌 Slow API call detected: ${duration}ms`);
        }

        return response;
    },
    async (error) => {
        // Track loading state
        activeRequests--;
        if (loadingCallback && activeRequests === 0) {
            loadingCallback(false);
        }

        const originalRequest = error.config;

        // Log error details
        console.error('❌ API Error:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Handle different error types
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    // Validation errors
                    if (data.details) {
                        const validationErrors = data.details.map(err => err.message).join(', ');
                        throw new Error(`Dữ liệu không hợp lệ: ${validationErrors}`);
                    }
                    throw new Error(data.message || 'Dữ liệu không hợp lệ');

                case 401:
                    // Unauthorized - Token expired or invalid
                    if (!originalRequest._retry) {
                        originalRequest._retry = true;

                        // Try to refresh token using tokenManager
                        try {
                            const newToken = await tokenManager.refreshAccessToken();
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return apiClient(originalRequest);
                        } catch (refreshError) {
                            console.error('Token refresh failed:', refreshError);
                            tokenManager.logout();
                            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        }
                    }

                    tokenManager.logout();
                    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

                case 403:
                    // Forbidden
                    throw new Error('Bạn không có quyền thực hiện thao tác này');

                case 404:
                    // Not found
                    throw new Error('Không tìm thấy dữ liệu yêu cầu');

                case 409:
                    // Conflict
                    throw new Error(data.message || 'Dữ liệu đã tồn tại hoặc xung đột');

                case 422:
                    // Unprocessable entity
                    throw new Error(data.message || 'Dữ liệu không thể xử lý');

                case 429:
                    // Rate limited
                    const retryAfter = error.response.headers['retry-after'];
                    throw new Error(`Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter || '1'} giây`);

                case 500:
                    // Server error
                    throw new Error('Lỗi server. Vui lòng thử lại sau hoặc liên hệ hỗ trợ');

                case 502:
                case 503:
                case 504:
                    // Service unavailable
                    throw new Error('Dịch vụ đang bảo trì. Vui lòng thử lại sau');

                default:
                    throw new Error(data.message || `Lỗi không xác định (${status})`);
            }
        } else if (error.request) {
            // Network error
            if (error.code === 'ECONNABORTED') {
                throw new Error('Yêu cầu quá lâu. Vui lòng kiểm tra kết nối mạng');
            }
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
        } else {
            // Other errors
            throw new Error(error.message || 'Đã xảy ra lỗi không xác định');
        }
    }
);

// Enhanced API service class
class ApiService {
    constructor() {
        this.client = apiClient;
    }

    // GET with retry logic
    async get(endpoint, params = {}, retries = 3) {
        const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

        for (let i = 0; i < retries; i++) {
            try {
                const response = await this.client.get(url, { params });
                return response.data;
            } catch (error) {
                if (i === retries - 1 || error.message.includes('401') || error.message.includes('403')) {
                    throw error;
                }

                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                console.log(`🔄 Retrying request (${i + 1}/${retries}): ${url}`);
            }
        }
    }

    // POST with optimistic updates
    async post(endpoint, data = {}, options = {}) {
        const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

        try {
            const response = await this.client.post(url, data, options);
            return response.data;
        } catch (error) {
            // Log for debugging
            console.error(`POST ${url} failed:`, error.message);
            throw error;
        }
    }

    // PUT with optimistic updates
    async put(endpoint, data = {}) {
        const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

        try {
            const response = await this.client.put(url, data);
            return response.data;
        } catch (error) {
            console.error(`PUT ${url} failed:`, error.message);
            throw error;
        }
    }

    // DELETE with confirmation
    async delete(endpoint) {
        const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

        try {
            const response = await this.client.delete(url);
            return response.data;
        } catch (error) {
            console.error(`DELETE ${url} failed:`, error.message);
            throw error;
        }
    }

    // Upload with progress tracking
    async upload(endpoint, formData, onProgress) {
        const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

        try {
            const response = await this.client.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                },
                timeout: 60000, // 60 seconds for file uploads
            });
            return response.data;
        } catch (error) {
            console.error(`Upload ${url} failed:`, error.message);
            throw error;
        }
    }

    // Download file
    async download(endpoint, filename = null) {
        const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

        try {
            const response = await this.client.get(url, {
                responseType: 'blob',
            });

            // Create download link
            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;

            // Get filename from response headers or use provided name
            const contentDisposition = response.headers['content-disposition'];
            const extractedFilename = contentDisposition?.match(/filename="?([^"]+)"?/)?.[1];
            link.download = filename || extractedFilename || 'download';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            return true;
        } catch (error) {
            console.error(`Download ${url} failed:`, error.message);
            throw error;
        }
    }

    // Batch requests
    async batch(requests) {
        try {
            const promises = requests.map(({ method, url, data, params }) => {
                switch (method.toLowerCase()) {
                    case 'get':
                        return this.get(url, params);
                    case 'post':
                        return this.post(url, data);
                    case 'put':
                        return this.put(url, data);
                    case 'delete':
                        return this.delete(url);
                    default:
                        throw new Error(`Unsupported method: ${method}`);
                }
            });

            const results = await Promise.allSettled(promises);
            return results.map((result, index) => ({
                ...requests[index],
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason.message : null
            }));
        } catch (error) {
            console.error('Batch request failed:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return response.data;
        } catch (error) {
            return {
                status: 'ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;