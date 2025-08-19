import apiService from './api.js';

export const importService = {
    /**
     * Import students from Excel file
     */
    async importStudentsFromExcel(file, onProgress = null) {
        const formData = new FormData();
        formData.append('file', file);

        return apiService.upload('/import/students', formData, onProgress);
    },

    /**
     * Import students from JSON data
     */
    async importStudentsFromJson(studentsData) {
        return apiService.post('/import/students', { students: studentsData });
    },

    /**
     * Import users from Excel file
     */
    async importUsersFromExcel(file, onProgress = null) {
        const formData = new FormData();
        formData.append('file', file);

        return apiService.upload('/import/users', formData, onProgress);
    },

    /**
     * Import users from JSON data
     */
    async importUsersFromJson(usersData) {
        return apiService.post('/import/users', { users: usersData });
    },

    /**
     * Get import statistics
     */
    async getImportStats() {
        return apiService.get('/import/stats');
    }
};

export default importService;