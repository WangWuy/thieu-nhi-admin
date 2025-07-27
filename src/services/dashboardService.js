// dashboardService.js
import api from './api.js';

export const dashboardService = {
    async getDashboardStats() {
        return api.get('/dashboard/stats');
    },

    async getQuickCounts() {
        return api.get('/dashboard/quick-counts');
    }
};