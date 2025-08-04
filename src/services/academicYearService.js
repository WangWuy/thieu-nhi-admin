// academicYearService.js
import api from './api.js';

export const academicYearService = {
    // Get all academic years
    async getAcademicYears() {
        return api.get('/academic-years');
    },

    // Get current academic year
    async getCurrentAcademicYear() {
        return api.get('/academic-years/current');
    },

    // Create new academic year
    async createAcademicYear(data) {
        return api.post('/academic-years', data);
    },

    // Update academic year
    async updateAcademicYear(id, data) {
        return api.put(`/academic-years/${id}`, data);
    },

    // Set current academic year
    async setCurrentAcademicYear(id) {
        return api.post(`/academic-years/${id}/set-current`);
    },

    // Delete academic year
    async deleteAcademicYear(id) {
        return api.delete(`/academic-years/${id}`);
    },

    // Get academic year statistics
    async getAcademicYearStats(id) {
        return api.get(`/academic-years/${id}/stats`);
    },

    // Recalculate scores for academic year
    async recalculateScores(id) {
        return api.post(`/academic-years/${id}/recalculate-scores`);
    }
};