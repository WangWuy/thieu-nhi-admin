// reportsService.js
import api from './api.js';

export const reportsService = {
    // Get attendance report
    async getAttendanceReport(params = {}) {
        return api.get('/reports/attendance', params);
    },

    // Get grade distribution report
    async getGradeDistribution(params = {}) {
        return api.get('/reports/grade-distribution', params);
    },

    // Get student ranking report
    async getStudentRanking(params = {}) {
        return api.get('/reports/student-ranking', params);
    },

    // Get overview report
    async getOverviewReport(params = {}) {
        return api.get('/reports/overview', params);
    },

    // Export report
    async exportReport(type, format = 'csv', filters = {}) {
        const params = new URLSearchParams({
            type,
            format,
            ...filters
        }).toString();

        if (format === 'csv') {
            // For CSV, trigger download
            const response = await fetch(`${api.defaults?.baseURL || ''}/api/reports/export?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token in localStorage
                }
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report_${type}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return { success: true, message: 'Đã tải xuống báo cáo' };
        } else {
            // For JSON, return data
            return api.get(`/reports/export?${params}`);
        }
    },

    // Utility methods
    async getAvailableFilters() {
        try {
            const [classes, departments, academicYears] = await Promise.all([
                api.get('/classes'),
                api.get('/departments'),
                api.get('/academic-years').catch(() => ({ data: [] }))
            ]);

            return {
                classes: classes.data || classes,
                departments: departments.data || departments,
                academicYears: academicYears.data || academicYears
            };
        } catch (error) {
            console.error('Failed to fetch filter options:', error);
            return {
                classes: [],
                departments: [],
                academicYears: []
            };
        }
    }
};