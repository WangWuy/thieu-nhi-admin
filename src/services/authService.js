import api from './api.js';

export const authService = {
    async login(credentials, rememberLogin = false) {
        const response = await api.post('/auth/login', credentials);

        if (response.token) {
            // Always save token and user to localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Save credentials if remember login is checked
            if (rememberLogin) {
                this.saveCredentials(credentials);
            } else {
                this.clearSavedCredentials();
            }
        }

        return response;
    },

    async getCurrentUser() {
        return api.get('/auth/me');
    },

    async changePassword(passwords) {
        return api.post('/auth/change-password', passwords);
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Note: Keep saved credentials unless user explicitly unchecks remember login
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getCurrentUserFromStorage() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Remember login functionality
    saveCredentials(credentials) {
        try {
            // Simple encoding (not for security, just to avoid plain text)
            const encoded = btoa(JSON.stringify({
                username: credentials.username,
                password: credentials.password,
                timestamp: Date.now()
            }));
            localStorage.setItem('rememberedCredentials', encoded);
        } catch (error) {
            console.warn('Failed to save credentials:', error);
        }
    },

    getSavedCredentials() {
        try {
            const encoded = localStorage.getItem('rememberedCredentials');
            if (!encoded) return null;

            const decoded = JSON.parse(atob(encoded));
            
            // Check if credentials are older than 30 days
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            if (decoded.timestamp < thirtyDaysAgo) {
                this.clearSavedCredentials();
                return null;
            }

            return {
                username: decoded.username,
                password: decoded.password
            };
        } catch (error) {
            console.warn('Failed to get saved credentials:', error);
            this.clearSavedCredentials();
            return null;
        }
    },

    clearSavedCredentials() {
        localStorage.removeItem('rememberedCredentials');
    },

    // Check if credentials are saved
    hasRememberedCredentials() {
        return !!this.getSavedCredentials();
    }
};