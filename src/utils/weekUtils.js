import { getMostRecentAttendanceDate } from './validAttendanceDatesUtils';

/**
 * Week calculation utilities for report filters
 */

/**
 * Get week number from date (ISO week with Monday as first day)
 * @param {Date} date - Target date
 * @returns {number} - Week number
 */
export const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    // Thursday in current week decides the year
    const thursday = new Date(d);
    thursday.setDate(d.getDate() + (4 - d.getDay()) % 7);
    
    // January 4 is always in week 1
    const yearStart = new Date(thursday.getFullYear(), 0, 4);
    
    // Find Monday of week containing January 4
    const week1Monday = new Date(yearStart);
    const jan4Day = yearStart.getDay();
    const daysToMonday = jan4Day === 0 ? -6 : 1 - jan4Day;
    week1Monday.setDate(yearStart.getDate() + daysToMonday);
    
    // Calculate week number
    const weekNumber = Math.floor((thursday.getTime() - week1Monday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    
    return weekNumber;
};

/**
 * Get default week value (YYYY-Www format) based on most recent Thursday
 * @returns {string} - Week value in YYYY-Www format
 */
export const getDefaultWeekValue = () => {
    const date = new Date(getMostRecentAttendanceDate('thursday'));
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
};

/**
 * Convert Date to local date string (avoid timezone issues)
 * @param {Date} date - Date object
 * @returns {string} - Date string in YYYY-MM-DD format
 */
const toLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Calculate week start and end dates from week value (Vietnam standard: Monday to Sunday)
 * @param {string} weekValue - Week in YYYY-Www format
 * @returns {Object} - { weekStart: Date, weekEnd: Date, startDateStr: string, endDateStr: string }
 */
export const calculateWeekDates = (weekValue) => {
    const [year, week] = weekValue.split('-W');
    const yearNum = parseInt(year);
    const weekNum = parseInt(week);
    
    // Create a date for January 1st of the target year
    const jan1 = new Date(yearNum, 0, 1);
    
    // Find the first Monday of the year (or the Monday of week 1)
    const jan1Day = jan1.getDay(); // 0 = Sunday, 1 = Monday, etc.
    let daysToFirstMonday;
    
    if (jan1Day <= 4) {
        // If Jan 1 is Mon-Thu, week 1 starts on the Monday of that week
        daysToFirstMonday = 1 - jan1Day;
    } else {
        // If Jan 1 is Fri-Sun, week 1 starts on the Monday of next week
        daysToFirstMonday = 8 - jan1Day;
    }
    
    const firstMonday = new Date(jan1);
    firstMonday.setDate(jan1.getDate() + daysToFirstMonday);
    
    // Calculate the Monday of the target week
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
    
    // Calculate Sunday (end of week)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
        weekStart,
        weekEnd,
        startDateStr: toLocalDateString(weekStart),
        endDateStr: toLocalDateString(weekEnd)
    };
};

/**
 * Format week range for display
 * @param {string} weekValue - Week in YYYY-Www format
 * @returns {string} - Formatted range like "Tuần từ 13/01 đến 19/01"
 */
export const formatWeekRange = (weekValue) => {
    if (!weekValue) return '';
    
    const { weekStart, weekEnd } = calculateWeekDates(weekValue);
    
    const formatDate = (d) => {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
    };
    
    return `Tuần từ ${formatDate(weekStart)} đến ${formatDate(weekEnd)}`;
};

/**
 * Handle week input change and update filters
 * @param {string} weekValue - New week value
 * @param {Function} setFilters - Filter setter function
 * @param {Function} setWeekRange - Week range setter function
 */
export const handleWeekChange = (weekValue, setFilters, setWeekRange) => {
    if (!weekValue) {
        setFilters(prev => ({ 
            ...prev, 
            startDate: '', 
            endDate: '', 
            weekValue: '', 
            weekDate: '' 
        }));
        setWeekRange('');
        return;
    }

    const { startDateStr, endDateStr } = calculateWeekDates(weekValue);
    
    setFilters(prev => ({
        ...prev,
        weekValue: weekValue,
        weekDate: startDateStr, // Keep for backward compatibility
        startDate: startDateStr,
        endDate: endDateStr
    }));
    
    setWeekRange(formatWeekRange(weekValue));
};