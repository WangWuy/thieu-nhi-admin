import apiService from './api.js';

export const importService = {
    /**
     * Parse Excel file before import
     */
    async parseExcelFile(file, type = 'student') {
        const formData = new FormData();
        formData.append('file', file);

        return apiService.upload(`/import/parse?type=${type}`, formData);
    },

    /**
     * Download Excel template
     */
    async downloadTemplate(type = 'student') {
        try {
            const response = await fetch(`${apiService.client.defaults.baseURL}/api/import/template/${type}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `template_${type}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Download template error:', error);
            throw new Error(`Không thể tải template: ${error.message}`);
        }
    },

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
     * Validate import data before processing
     */
    async validateImportData(type, data) {
        return apiService.post('/import/validate', { type, data });
    },

    /**
     * Get import statistics
     */
    async getImportStats() {
        return apiService.get('/import/stats');
    },

    /**
     * Batch import with progress tracking
     */
    async batchImport(type, data, onProgress = null) {
        const endpoint = type === 'student' ? '/import/students' : '/import/users';
        const payload = type === 'student' ? { students: data } : { users: data };

        try {
            // If onProgress callback is provided, simulate progress
            if (onProgress) {
                onProgress(0);

                // Simulate progress during the API call
                const progressInterval = setInterval(() => {
                    // This is just a simulation - real progress would come from the server
                    const currentProgress = Math.min(Math.random() * 100, 95);
                    onProgress(currentProgress);
                }, 500);

                const result = await apiService.post(endpoint, payload);

                clearInterval(progressInterval);
                onProgress(100);

                return result;
            }

            return apiService.post(endpoint, payload);
        } catch (error) {
            if (onProgress) onProgress(0);
            throw error;
        }
    },

    /**
     * Process Excel file with full workflow
     */
    async processExcelFile(file, type = 'student', options = {}) {
        const {
            onParseProgress = null,
            onImportProgress = null,
            validateOnly = false
        } = options;

        try {
            // Step 1: Parse file
            if (onParseProgress) onParseProgress(10);
            const parseResult = await this.parseExcelFile(file, type);

            if (onParseProgress) onParseProgress(50);

            // Return parse result if validation only
            if (validateOnly) {
                if (onParseProgress) onParseProgress(100);
                return {
                    step: 'parsed',
                    data: parseResult
                };
            }

            // Step 2: Import data
            if (onParseProgress) onParseProgress(100);

            if (parseResult.preview && parseResult.preview.length > 0) {
                const importResult = await (type === 'student'
                    ? this.importStudentsFromJson(parseResult.preview)
                    : this.importUsersFromJson(parseResult.preview)
                );

                return {
                    step: 'imported',
                    parseResult,
                    importResult
                };
            } else {
                throw new Error('Không có dữ liệu hợp lệ để import');
            }

        } catch (error) {
            console.error('Process Excel file error:', error);
            throw error;
        }
    }
};

export default importService;