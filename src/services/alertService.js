import apiService from './api.js';

export const alertService = {
    async getAlerts(params = {}) {
        return apiService.get('/alerts', params);
    },

    async evaluateRules(params = {}) {
        return apiService.post('/alerts/evaluate', params);
    },

    async createAlert(data) {
        return apiService.post('/alerts', data);
    },

    async markRead(id) {
        return apiService.put(`/alerts/${id}/read`);
    },

    async markResolved(id) {
        return apiService.put(`/alerts/${id}/resolve`);
    },

    async deleteAlert(id) {
        return apiService.delete(`/alerts/${id}`);
    },

    async getRules() {
        return apiService.get('/alert-rules');
    },

    async createRule(data) {
        return apiService.post('/alert-rules', data);
    },

    async updateRule(id, data) {
        return apiService.put(`/alert-rules/${id}`, data);
    },

    async toggleRule(id) {
        return apiService.put(`/alert-rules/${id}/toggle`);
    },

    async deleteRule(id) {
        return apiService.delete(`/alert-rules/${id}`);
    }
};

export default alertService;
