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

    // Export report - Updated for XLSX support
    async exportReport(type, format = 'xlsx', filters = {}) {
        const params = new URLSearchParams({
            type,
            format,
            ...filters
        }).toString();

        // For file exports (xlsx, csv), trigger download
        if (format === 'xlsx' || format === 'csv') {
            const response = await fetch(`${api.defaults?.baseURL || ''}/api/reports/export?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Export failed: ${errorText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Generate filename based on format
            const fileExtension = format === 'xlsx' ? 'xlsx' : 'csv';
            const filename = this.generateReportFilename(type, fileExtension);
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return {
                success: true,
                message: `Đã tải xuống báo cáo ${format.toUpperCase()}`,
                filename
            };
        } else {
            // For JSON, return data
            return api.get(`/reports/export?${params}`);
        }
    },

    // Generate consistent report filenames
    generateReportFilename(type, extension) {
        const date = new Date().toISOString().split('T')[0];
        const typeNames = {
            attendance: 'diem_danh',
            ranking: 'xep_hang',
            'grade-distribution': 'phan_bo_diem',
            overview: 'tong_quan'
        };

        const typeName = typeNames[type] || type;
        return `bao_cao_${typeName}_${date}.${extension}`;
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
    },

    // Helper method for attendance report export specifically
    async exportAttendanceReport(filters = {}) {
        return this.exportReport('attendance', 'xlsx', filters);
    },

    // Helper method for ranking report export
    async exportRankingReport(filters = {}) {
        return this.exportReport('ranking', 'xlsx', filters);
    }
};