// reportsService.js
import api from './api.js';

export const reportsService = {
    // Get attendance report
    async getAttendanceReport(params = {}) {
        return api.get('/reports/attendance', params);
    },

    // Get student scores report (renamed from student ranking)
    async getStudentScores(params = {}) {
        return api.get('/reports/student-scores', params);
    },

    // Generate consistent report filenames
    generateReportFilename(type, extension) {
        const date = new Date().toISOString().split('T')[0];
        const typeNames = {
            attendance: 'diem_danh',
            'student-scores': 'bang_diem'
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
};