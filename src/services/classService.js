import api from './api.js';

export const classService = {
    async getClasses() {
        return api.get('/classes');
    },

    async getClassById(id) {
        return api.get(`/classes/${id}`);
    },

    async createClass(classData) {
        return api.post('/classes', classData);
    },

    async updateClass(id, classData) {
        return api.put(`/classes/${id}`, classData);
    },

    async deleteClass(id) {
        return api.delete(`/classes/${id}`);
    },

    async assignTeacher(classId, teacherData) {
        return api.post(`/classes/${classId}/teachers`, teacherData);
    },

    async removeTeacher(classId, userId) {
        return api.delete(`/classes/${classId}/teachers/${userId}`);
    }
};