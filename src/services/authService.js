import api from './api.js';

export const authService = {
    async login(credentials, rememberLogin = false) {
        const response = await api.post('/auth/login', credentials);
        const rawUser = response.user || response;
        const normalizedUser = this.normalizeUser(rawUser);

        if (response.token) {
            // Always save token and user to localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(normalizedUser));

            // Save credentials if remember login is checked
            if (rememberLogin) {
                this.saveCredentials(credentials);
            } else {
                this.clearSavedCredentials();
            }
        }

        return { ...response, user: normalizedUser };
    },

    async getCurrentUser() {
        try {
            const response = await api.get('/auth/me');
            
            // ✅ Parse assigned class 
            const rawUser = response.user || response;
            const user = this.normalizeUser(rawUser);

            // Update localStorage với user info mới
            localStorage.setItem('user', JSON.stringify(user));
            
            return user;
        } catch (error) {
            console.error('Get current user error:', error);
            // Fallback to localStorage user if API fails
            return this.getCurrentUserFromStorage();
        }
    },

    // ✅ Helper method để parse class từ classTeachers
    getAssignedClass(classTeachers) {
        if (!classTeachers || !Array.isArray(classTeachers) || classTeachers.length === 0) return null;

        // Prefer the primary class if flagged, otherwise first available
        const primaryClass = classTeachers.find((ct) => ct.isPrimary) || classTeachers[0];
        return primaryClass.class || primaryClass.classInfo || null;
    },

    async changePassword(currentPassword, newPassword) {
        return api.post('/auth/change-password', {
            currentPassword,
            newPassword
        });
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Note: Keep saved credentials unless user explicitly unchecks remember login
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getCurrentUserFromStorage() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    updateStoredUser(updates = {}) {
        const currentUser = this.getCurrentUserFromStorage() || {};
        const updatedUser = this.normalizeUser({ ...currentUser, ...updates });
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
    },

    // ✅ Get user with assigned class info (sync method)
    getCurrentUserSync() {
        const user = this.getCurrentUserFromStorage();
        return this.normalizeUser(user);
    },

    // Normalize user object to ensure class info is available in a consistent shape
    normalizeUser(userData) {
        if (!userData) return userData;

        const classTeachers = this.normalizeClassTeachers(userData);
        const assignedClass = this.getAssignedClass(classTeachers);

        return {
            ...userData,
            classTeachers,
            assignedClass
        };
    },

    // Support both old (classTeachers) and new (classTeacher with classInfo) response shapes
    normalizeClassTeachers(userData) {
        if (!userData) return [];

        const classTeachers = Array.isArray(userData.classTeachers)
            ? userData.classTeachers
            : userData.classTeacher
                ? [userData.classTeacher]
                : [];

        return classTeachers.map((ct) => {
            const classData = ct.class || ct.classInfo;
            return classData ? { ...ct, class: classData } : ct;
        });
    },

    // Remember login functionality
    saveCredentials(credentials) {
        try {
            // Simple encoding (not for security, just to avoid plain text)
            const encoded = btoa(JSON.stringify({
                username: credentials.username,
                password: credentials.password,
                timestamp: Date.now()
            }));
            localStorage.setItem('rememberedCredentials', encoded);
        } catch (error) {
            console.warn('Failed to save credentials:', error);
        }
    },

    getSavedCredentials() {
        try {
            const encoded = localStorage.getItem('rememberedCredentials');
            if (!encoded) return null;

            const decoded = JSON.parse(atob(encoded));
            
            // Check if credentials are older than 30 days
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            if (decoded.timestamp < thirtyDaysAgo) {
                this.clearSavedCredentials();
                return null;
            }

            return {
                username: decoded.username,
                password: decoded.password
            };
        } catch (error) {
            console.warn('Failed to get saved credentials:', error);
            this.clearSavedCredentials();
            return null;
        }
    },

    clearSavedCredentials() {
        localStorage.removeItem('rememberedCredentials');
    },

    // Check if credentials are saved
    hasRememberedCredentials() {
        return !!this.getSavedCredentials();
    }
};
