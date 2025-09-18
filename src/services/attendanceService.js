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
    },

    async previewAttendance(formData) {
        return api.post('/import/attendance/preview', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    
    async importAttendance(formData) {
        return api.post('/import/attendance', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    async getTodayAttendanceStatus({ studentCodes, date, type }) {
        return api.post('/attendance/today-status', 
            { studentCodes }, 
            { queryParams: { 
                date: date.toISOString().split('T')[0], 
                type 
            }}
        );
    },

    async undoAttendance(attendanceData) {
        return api.post('/attendance/undo', attendanceData);
    },
};