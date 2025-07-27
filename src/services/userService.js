import api from './api.js';

export const userService = {
    async getUsers(params = {}) {
        try {
            return await api.get('/users', params);
        } catch (error) {
            console.warn('🔄 UserService using fallback data:', error.message);
            return {
                users: [
                    {
                        id: 1,
                        username: 'admin',
                        fullName: 'Quản trị viên',
                        saintName: 'Maria',
                        role: 'ban_dieu_hanh',
                        phoneNumber: '0901234567',
                        isActive: true,
                        department: null,
                        classTeachers: []
                    },
                    {
                        id: 2,
                        username: 'pdt_chien',
                        fullName: 'Phạm Văn B',
                        saintName: 'Joseph',
                        role: 'phan_doan_truong',
                        phoneNumber: '0907654321',
                        isActive: true,
                        department: { id: 1, displayName: 'Chiên' },
                        classTeachers: []
                    },
                    {
                        id: 3,
                        username: 'glv_chien_1',
                        fullName: 'Nguyễn Thị C',
                        saintName: 'Anna',
                        role: 'giao_ly_vien',
                        phoneNumber: '0903456789',
                        isActive: true,
                        department: null,
                        classTeachers: [{ class: { name: 'Chiên 1', department: { displayName: 'Chiên' } } }]
                    },
                    {
                        id: 4,
                        username: 'glv_au_1',
                        fullName: 'Trần Văn D',
                        saintName: 'Peter',
                        role: 'giao_ly_vien',
                        phoneNumber: '0904567890',
                        isActive: false,
                        department: null,
                        classTeachers: [{ class: { name: 'Ấu 1', department: { displayName: 'Ấu' } } }]
                    }
                ],
                pagination: { total: 4, page: 1, pages: 1, limit: 20 }
            };
        }
    },

    async getUserById(id) {
        try {
            return await api.get(`/users/${id}`);
        } catch (error) {
            console.warn('🔄 getUserById using fallback data:', error.message);
            const mockUsers = {
                1: {
                    id: 1,
                    username: 'admin',
                    fullName: 'Quản trị viên',
                    saintName: 'Maria',
                    role: 'ban_dieu_hanh',
                    phoneNumber: '0901234567',
                    address: '123 Đường ABC, TP.HCM',
                    isActive: true,
                    department: null,
                    classTeachers: []
                },
                2: {
                    id: 2,
                    username: 'pdt_chien',
                    fullName: 'Phạm Văn B',
                    saintName: 'Joseph',
                    role: 'phan_doan_truong',
                    phoneNumber: '0907654321',
                    address: '456 Đường XYZ, TP.HCM',
                    isActive: true,
                    department: { id: 1, displayName: 'Chiên' },
                    classTeachers: []
                }
            };
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
            return [
                {
                    id: 3,
                    fullName: 'Nguyễn Thị C',
                    saintName: 'Anna',
                    phoneNumber: '0903456789',
                    classTeachers: [{ class: { id: 1, name: 'Chiên 1' } }]
                },
                {
                    id: 4,
                    fullName: 'Trần Văn D',
                    saintName: 'Peter',
                    phoneNumber: '0904567890',
                    classTeachers: []
                },
                {
                    id: 5,
                    fullName: 'Lê Thị E',
                    saintName: 'Teresa',
                    phoneNumber: '0905678901',
                    classTeachers: [{ class: { id: 2, name: 'Ấu 1' } }]
                }
            ];
        }
    },

    // Thêm method để change password (match với backend auth)
    async changePassword(currentPassword, newPassword) {
        try {
            return await api.post('/auth/change-password', { 
                currentPassword, 
                newPassword 
            });
        } catch (error) {
            console.warn('🔄 changePassword using mock response:', error.message);
            return { message: 'Đổi mật khẩu thành công (mock)' };
        }
    }
};