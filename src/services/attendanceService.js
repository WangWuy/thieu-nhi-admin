import api from './api.js';

export const attendanceService = {
    async markAttendance(attendanceData) {
        return api.post('/attendance', attendanceData);
    },

    async getAttendanceByClass(classId, params = {}) {
        return api.get(`/classes/${classId}/attendance`, params);
    },

    async getAttendanceStats(params = {}) {
        return api.get('/attendance/stats', params);
    },

    async batchMarkAttendance(classId, batchData) {
        return api.post(`/classes/${classId}/attendance/batch`, batchData);
    },

    async getAttendanceTrend(params = {}) {
        return api.get('/attendance/trend', params);
    }
};