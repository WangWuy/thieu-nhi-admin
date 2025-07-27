import api from './api.js';

export const departmentService = {
    async getDepartments() {
        return api.get('/departments');
    },

    async getDepartmentStats() {
        return api.get('/departments/stats');
    }
};