import api from './api.js';

export const authService = {
    async login(credentials) {
        const response = await api.post('/auth/login', credentials);

        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
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
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getCurrentUserFromStorage() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};