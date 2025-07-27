import { jwtDecode } from 'jwt-decode';

class TokenManager {
    constructor() {
        this.refreshTimer = null;
        this.refreshPromise = null;
        this.isRefreshing = false;
    }

    // Set tokens và start auto refresh
    setTokens(accessToken, refreshToken = null) {
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }

        this.scheduleTokenRefresh(accessToken);
    }

    // Get valid access token (auto refresh if needed)
    async getValidAccessToken() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No access token available');
        }

        // Check if token is expired or will expire soon
        if (this.isTokenExpiredOrExpiring(token)) {
            return await this.refreshAccessToken();
        }

        return token;
    }

    // Check if token is expired or expiring soon (within 5 minutes)
    isTokenExpiredOrExpiring(token, bufferMinutes = 5) {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const bufferTime = bufferMinutes * 60; // Convert to seconds

            return decoded.exp <= (currentTime + bufferTime);
        } catch (error) {
            console.error('Invalid token format:', error);
            return true; // Treat invalid tokens as expired
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        // Prevent multiple simultaneous refresh attempts
        if (this.isRefreshing) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            // Check if refresh token is expired
            if (this.isTokenExpiredOrExpiring(refreshToken, 0)) {
                throw new Error('Refresh token expired');
            }

            this.refreshPromise = this.performTokenRefresh(refreshToken);
            const newAccessToken = await this.refreshPromise;

            return newAccessToken;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearTokens();
            this.redirectToLogin();
            throw error;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    // Perform actual token refresh API call
    async performTokenRefresh(refreshToken) {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                throw new Error(`Refresh failed: ${response.status}`);
            }

            const data = await response.json();
            const { token: newAccessToken, refreshToken: newRefreshToken } = data;

            // Update tokens
            this.setTokens(newAccessToken, newRefreshToken);

            console.log('✅ Token refreshed successfully');
            return newAccessToken;
        } catch (error) {
            console.error('❌ Token refresh API failed:', error);
            throw error;
        }
    }

    // Schedule automatic token refresh
    scheduleTokenRefresh(token) {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const expiryTime = decoded.exp;

            // Schedule refresh 5 minutes before expiry
            const refreshTime = (expiryTime - currentTime - 300) * 1000; // Convert to ms

            if (refreshTime > 0) {
                // Clear existing timer
                if (this.refreshTimer) {
                    clearTimeout(this.refreshTimer);
                }

                this.refreshTimer = setTimeout(() => {
                    console.log('🔄 Auto-refreshing token...');
                    this.refreshAccessToken().catch(error => {
                        console.error('Auto-refresh failed:', error);
                    });
                }, refreshTime);

                console.log(`⏰ Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);
            } else {
                console.warn('⚠️ Token already expired or expiring soon');
                this.refreshAccessToken().catch(error => {
                    console.error('Immediate refresh failed:', error);
                });
            }
        } catch (error) {
            console.error('Error scheduling token refresh:', error);
        }
    }

    // Get token info
    getTokenInfo(token = null) {
        const accessToken = token || localStorage.getItem('token');

        if (!accessToken) {
            return null;
        }

        try {
            const decoded = jwtDecode(accessToken);
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = decoded.exp - currentTime;

            return {
                userId: decoded.userId,
                username: decoded.username,
                role: decoded.role,
                departmentId: decoded.departmentId,
                fullName: decoded.fullName,
                expiresAt: new Date(decoded.exp * 1000),
                isExpired: decoded.exp <= currentTime,
                timeUntilExpiry: Math.max(0, timeUntilExpiry),
                timeUntilExpiryMinutes: Math.max(0, Math.round(timeUntilExpiry / 60))
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('token');
        if (!token) return false;

        return !this.isTokenExpiredOrExpiring(token, 0);
    }

    // Clear all tokens
    clearTokens() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }

        console.log('🗑️ Tokens cleared');
    }

    // Redirect to login
    redirectToLogin() {
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
            console.log('🔄 Redirecting to login...');
            window.location.href = '/login';
        }
    }

    // Initialize token manager (call this on app start)
    initialize() {
        const token = localStorage.getItem('token');
        if (token && !this.isTokenExpiredOrExpiring(token, 0)) {
            this.scheduleTokenRefresh(token);
            console.log('✅ Token manager initialized');
        } else if (token) {
            console.log('🔄 Found expired token, attempting refresh...');
            this.refreshAccessToken().catch(() => {
                console.log('❌ Initial refresh failed, user needs to login');
            });
        }
    }

    // Handle user activity (reset refresh timer)
    handleUserActivity() {
        const token = localStorage.getItem('token');
        if (token && !this.isTokenExpiredOrExpiring(token, 0)) {
            this.scheduleTokenRefresh(token);
        }
    }

    // Logout user
    logout() {
        this.clearTokens();
        this.redirectToLogin();
    }
}

// Export singleton instance
const tokenManager = new TokenManager();

// Setup activity listeners để reset refresh timer
let activityTimer;
const resetActivityTimer = () => {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        tokenManager.handleUserActivity();
    }, 1000); // Debounce 1 second
};

// Listen for user activity
if (typeof window !== 'undefined') {
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetActivityTimer, true);
    });
}

export default tokenManager;