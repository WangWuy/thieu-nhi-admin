import api from './api.js';

export const userService = {
    async getUsers(params = {}) {
        try {
            return await api.get('/users', params);
        } catch (error) {
            console.warn('🔄 UserService using fallback data:', error.message);
            return {
                users: [],
                pagination: { total: 0, page: 1, pages: 1, limit: 20 }
            };
        }
    },

    async getUserById(id) {
        try {
            return await api.get(`/users/${id}`);
        } catch (error) {
            console.warn('🔄 getUserById using fallback data:', error.message);
            const mockUsers = {};
            return mockUsers[id] || mockUsers[1];
        }
    },

    async createUser(userData) {
        try {
            return await api.post('/users', userData);
        } catch (error) {
            console.warn('🔄 createUser using mock response:', error.message);
            return {
                id: Date.now(),
                ...userData,
                isActive: true,
                createdAt: new Date().toISOString(),
                department: userData.departmentId ? { id: userData.departmentId, displayName: 'Mock Department' } : null
            };
        }
    },

    async updateUser(id, userData) {
        try {
            return await api.put(`/users/${id}`, userData);
        } catch (error) {
            console.warn('🔄 updateUser using mock response:', error.message);
            return {
                id: parseInt(id),
                ...userData,
                isActive: true,
                updatedAt: new Date().toISOString()
            };
        }
    },

    // FIX: Đổi method từ PUT sang POST để match backend
    async resetPassword(id, newPassword) {
        try {
            return await api.post(`/users/${id}/reset-password`, { newPassword });
        } catch (error) {
            console.warn('🔄 resetPassword using mock response:', error.message);
            return { message: 'Reset mật khẩu thành công (mock)' };
        }
    },

    async deactivateUser(id) {
        try {
            return await api.put(`/users/${id}/deactivate`);
        } catch (error) {
            console.warn('🔄 deactivateUser using mock response:', error.message);
            return { message: 'Khóa tài khoản thành công (mock)' };
        }
    },

    // FIX: Đổi endpoint từ '/users/teachers' sang '/teachers' để match backend
    async getTeachers(departmentId = null) {
        try {
            const params = departmentId ? { departmentId } : {};
            return await api.get('/teachers', params); // FIX: Đổi thành '/teachers'
        } catch (error) {
            console.warn('🔄 getTeachers using fallback data:', error.message);
            return [];
        }
    },
};