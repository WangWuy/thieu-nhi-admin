import { ATTENDANCE_TYPES } from './constants';
import { useState } from 'react';

/**
 * Date and attendance validation utilities
 */

/**
 * Get date limits and default attendance type
 * @returns {Object} { maxDate, defaultType }
 */
export const getDateLimits = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7

    return {
        maxDate: today.toISOString().split('T')[0], // Không cho chọn tương lai
        defaultType: currentDay === 0 ? ATTENDANCE_TYPES.SUNDAY : ATTENDANCE_TYPES.THURSDAY
    };
};

/**
 * Get appropriate attendance type for a given date
 * @param {string|Date} date - Target date
 * @returns {string} - Attendance type (thursday or sunday)
 */
export const getAttendanceTypeForDate = (date) => {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    return dayOfWeek === 0 ? ATTENDANCE_TYPES.SUNDAY : ATTENDANCE_TYPES.THURSDAY;
};

/**
 * Validate if selected date is appropriate for attendance type
 * @param {string|Date} date - Selected date
 * @param {string} attendanceType - Selected attendance type
 * @returns {Object} { isValid, suggestedType, message }
 */
export const validateDateAttendanceType = (date, attendanceType) => {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const suggestedType = getAttendanceTypeForDate(date);

    if (attendanceType === suggestedType) {
        return {
            isValid: true,
            suggestedType: null,
            message: null
        };
    }

    let message = '';
    if (dayOfWeek === 0 && attendanceType === ATTENDANCE_TYPES.THURSDAY) {
        message = 'Ngày được chọn là Chủ nhật, buổi điểm danh nên là Chủ nhật';
    } else if (dayOfWeek !== 0 && attendanceType === ATTENDANCE_TYPES.SUNDAY) {
        message = 'Ngày được chọn không phải Chủ nhật, buổi điểm danh nên là Thứ 5';
    }

    return {
        isValid: false,
        suggestedType,
        message
    };
};

/**
 * Auto-correct attendance type based on selected date
 * @param {string|Date} date - Selected date
 * @param {string} currentType - Current attendance type
 * @returns {string} - Corrected attendance type
 */
export const autoCorrectAttendanceType = (date, currentType) => {
    const suggestedType = getAttendanceTypeForDate(date);
    return suggestedType;
};

/**
 * Check if date is in the past or today (valid for attendance)
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if valid attendance date
 */
export const isValidAttendanceDate = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    
    // Reset time to compare only dates
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return selectedDate <= today;
};

/**
 * Get next valid attendance date based on type
 * @param {string} attendanceType - Attendance type
 * @param {string|Date} fromDate - Starting date (default: today)
 * @returns {string} - Next valid date in YYYY-MM-DD format
 */
export const getNextAttendanceDate = (attendanceType, fromDate = new Date()) => {
    const date = new Date(fromDate);
    const currentDay = date.getDay();
    
    let daysToAdd = 0;
    
    if (attendanceType === ATTENDANCE_TYPES.SUNDAY) {
        // Find next Sunday (or today if it's Sunday)
        daysToAdd = currentDay === 0 ? 0 : 7 - currentDay;
    } else if (attendanceType === ATTENDANCE_TYPES.THURSDAY) {
        // Find next Thursday (or today if it's Thursday)
        if (currentDay <= 4) {
            daysToAdd = 4 - currentDay;
        } else {
            daysToAdd = 7 - currentDay + 4;
        }
    }
    
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
};

/**
 * Get previous valid attendance date based on type
 * @param {string} attendanceType - Attendance type
 * @param {string|Date} fromDate - Starting date (default: today)
 * @returns {string} - Previous valid date in YYYY-MM-DD format
 */
export const getPreviousAttendanceDate = (attendanceType, fromDate = new Date()) => {
    const date = new Date(fromDate);
    const currentDay = date.getDay();
    
    let daysToSubtract = 0;
    
    if (attendanceType === ATTENDANCE_TYPES.SUNDAY) {
        // Find previous Sunday
        daysToSubtract = currentDay === 0 ? 7 : currentDay;
    } else if (attendanceType === ATTENDANCE_TYPES.THURSDAY) {
        // Find previous Thursday
        if (currentDay >= 4) {
            daysToSubtract = currentDay - 4;
        } else {
            daysToSubtract = currentDay + 3;
        }
    }
    
    date.setDate(date.getDate() - daysToSubtract);
    return date.toISOString().split('T')[0];
};

/**
 * Hook for managing date and attendance type state with validation
 * @param {Object} initialState - { date, attendanceType }
 * @returns {Object} - State and handlers
 */
export const useDateAttendanceValidation = (initialState = {}) => {
    const [state, setState] = useState({
        date: initialState.date || new Date().toISOString().split('T')[0],
        attendanceType: initialState.attendanceType || getDateLimits().defaultType,
        validation: { isValid: true, message: null }
    });

    const updateDate = (newDate) => {
        const suggestedType = getAttendanceTypeForDate(newDate);
        const validation = validateDateAttendanceType(newDate, state.attendanceType);
        
        setState(prev => ({
            ...prev,
            date: newDate,
            attendanceType: suggestedType, // Auto-correct
            validation
        }));
    };

    const updateAttendanceType = (newType) => {
        const validation = validateDateAttendanceType(state.date, newType);
        
        setState(prev => ({
            ...prev,
            attendanceType: newType,
            validation
        }));
    };

    return {
        ...state,
        updateDate,
        updateAttendanceType,
        isValidDate: isValidAttendanceDate(state.date)
    };
};