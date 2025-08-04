// dashboardService.js
import api from './api.js';

export const dashboardService = {
    async getDashboardStats() {
        return api.get('/dashboard/stats');
    },

    async getQuickCounts() {
        return api.get('/dashboard/quick-counts');
    },

    // NEW: Get score overview for dashboard
    async getScoreOverview(params = {}) {
        return api.get('/dashboard/score-overview', params);
    },

    // NEW: Get department score comparison
    async getDepartmentScoreComparison(params = {}) {
        return api.get('/dashboard/department-scores', params);
    }
};