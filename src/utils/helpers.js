import { ROLE_NAMES, DEPARTMENT_NAMES, ATTENDANCE_TYPE_NAMES } from './constants.js';

export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
};

export const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN');
};

export const getRoleName = (role) => {
    return ROLE_NAMES[role] || role;
};

export const getDepartmentName = (name) => {
    return DEPARTMENT_NAMES[name] || name;
};

export const getAttendanceTypeName = (type) => {
    return ATTENDANCE_TYPE_NAMES[type] || type;
};