// dashboardService.js
import api from './api.js';

export const dashboardService = {
    async getDashboardStats() {
        return api.get('/dashboard/stats');
    },

    async getQuickCounts() {
        return api.get('/dashboard/quick-counts');
    },

    // Get score overview for dashboard
    async getScoreOverview(params = {}) {
        return api.get('/dashboard/score-overview', params);
    },

    // Get department score comparison
    async getDepartmentScoreComparison(params = {}) {
        return api.get('/dashboard/department-scores', params);
    },

    // Get weekly attendance trend (4 weeks)
    async getWeeklyAttendanceTrend(attendanceType = 'sunday') {
        return api.get('/dashboard/weekly-attendance-trend', {
            attendanceType
        });
    },

    async getDepartmentClassesAttendance({ department, attendanceType, date }) {
        return api.get('/dashboard/department-classes-attendance', {
            department,
            attendanceType,
            date
        });
    }
};