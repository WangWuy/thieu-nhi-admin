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

    async universalAttendance(attendanceData) {
        return api.post('/attendance/universal', attendanceData);
    },

    async getAttendanceTrend(params = {}) {
        return api.get('/attendance/trend', params);
    }
};