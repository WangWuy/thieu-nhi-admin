/**
 * Utils for getting valid attendance dates (only Thursdays and Sundays)
 */

/**
 * Get list of valid attendance dates (Thursdays or Sundays) in the past
 * @param {string} attendanceType - 'thursday' or 'sunday'
 * @param {number} weeksBack - Number of weeks to go back (default: 12)
 * @returns {Array} - Array of date objects with { value, label, date }
 */
export const getValidAttendanceDates = (attendanceType, weeksBack = 12) => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < weeksBack; i++) {
        const weekDate = new Date(today);
        weekDate.setDate(today.getDate() - (i * 7));
        
        let targetDate;
        if (attendanceType === 'thursday') {
            // Find Thursday of this week
            const dayOfWeek = weekDate.getDay();
            const daysToThursday = dayOfWeek === 0 ? -3 : 4 - dayOfWeek; // 0=Sunday
            targetDate = new Date(weekDate);
            targetDate.setDate(weekDate.getDate() + daysToThursday);
        } else if (attendanceType === 'sunday') {
            // Find Sunday of this week
            const dayOfWeek = weekDate.getDay();
            const daysToSunday = dayOfWeek === 0 ? 0 : -dayOfWeek; // 0=Sunday
            targetDate = new Date(weekDate);
            targetDate.setDate(weekDate.getDate() + daysToSunday);
        }
        
        // Only include past dates and today
        if (targetDate <= today) {
            const dateStr = targetDate.toISOString().split('T')[0];
            const label = `${attendanceType === 'thursday' ? 'T5' : 'CN'} ${targetDate.toLocaleDateString('vi-VN')}`;
            
            dates.push({
                value: dateStr,
                label,
                date: targetDate
            });
        }
    }
    
    return dates.sort((a, b) => b.date - a.date); // Newest first
};

/**
 * Check if a date is a valid Thursday or Sunday
 * @param {string|Date} date - Date to check
 * @param {string} attendanceType - Expected attendance type
 * @returns {boolean} - True if valid
 */
export const isValidAttendanceDate = (date, attendanceType) => {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    
    if (attendanceType === 'thursday') {
        return dayOfWeek === 4; // Thursday
    } else if (attendanceType === 'sunday') {
        return dayOfWeek === 0; // Sunday
    }
    
    return false;
};

/**
 * Get the most recent valid attendance date
 * @param {string} attendanceType - 'thursday' or 'sunday'
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const getMostRecentAttendanceDate = (attendanceType) => {
    const today = new Date();
    
    for (let i = 0; i <= 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        
        if (isValidAttendanceDate(checkDate, attendanceType)) {
            return checkDate.toISOString().split('T')[0];
        }
    }
    
    // Fallback
    const validDates = getValidAttendanceDates(attendanceType, 2);
    return validDates[0]?.value || today.toISOString().split('T')[0];
};