import { sortStudentsByLastName } from './helpers';
/**
 * Utilities for AttendancePreview component
 */

/**

/**
 * Group attendance data by student and week
 * @param {Array} attendanceData - Raw attendance records
 * @returns {Object} - { attendanceByStudentAndWeek: Map, allWeeks: Map }
 */
export const groupAttendanceByStudentAndWeek = (attendanceData = []) => {
    const attendanceByStudentAndWeek = {};
    const allWeeks = new Map();

    attendanceData.forEach(record => {
        const studentId = record.student.id;
        const recordDate = new Date(record.attendanceDate);

        // Calculate week start (Monday)
        const day = recordDate.getDay();
        const diff = recordDate.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(recordDate);
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);

        const weekKey = weekStart.toISOString().split('T')[0];

        // Determine column type and representative date
        let columnType, representativeDate;

        if (record.attendanceType === 'sunday') {
            columnType = 'sunday';
            representativeDate = recordDate.toISOString().split('T')[0];
        } else {
            columnType = 'thursday';
            const thursday = new Date(weekStart);
            thursday.setDate(weekStart.getDate() + 4);
            representativeDate = thursday.toISOString().split('T')[0];
        }

        const columnKey = `${columnType}_${representativeDate}`;

        // Store week info
        allWeeks.set(columnKey, {
            type: columnType,
            date: representativeDate,
            weekStart: weekKey
        });

        // Group student attendance
        if (!attendanceByStudentAndWeek[studentId]) {
            attendanceByStudentAndWeek[studentId] = {
                student: record.student,
                attendance: {}
            };
        }

        if (record.isPresent) {
            attendanceByStudentAndWeek[studentId].attendance[columnKey] = true;
        }
    });

    return { attendanceByStudentAndWeek, allWeeks };
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
 * Create default columns when no attendance data exists
 * @param {Object} filters - Filter object with startDate/endDate
 * @returns {Array} - Array of [columnKey, columnInfo] pairs
 */
export const createDefaultColumns = (filters) => {
    if (!filters || !filters.startDate || !filters.endDate) {
        return [];
    }

    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    const columns = [];

    // Since filters.startDate should already be Monday, use it directly
    const weekStart = new Date(filters.startDate);
    
    // Create Thursday column (3 days after Monday)
    const thursday = new Date(weekStart);
    thursday.setDate(weekStart.getDate() + 3);
    
    // Create Sunday column (6 days after Monday)  
    const sunday = new Date(weekStart);
    sunday.setDate(weekStart.getDate() + 6);

    const thursdayKey = `thursday_${toLocalDateString(thursday)}`;
    columns.push([thursdayKey, {
        type: 'thursday',
        date: toLocalDateString(thursday),
        weekStart: toLocalDateString(weekStart)
    }]);

    const sundayKey = `sunday_${toLocalDateString(sunday)}`;
    columns.push([sundayKey, {
        type: 'sunday',
        date: toLocalDateString(sunday),
        weekStart: toLocalDateString(weekStart)
    }]);

    return columns;
};

/**
 * Merge students with and without attendance data
 * @param {Object} attendanceByStudentAndWeek - Students with attendance
 * @param {Array} studentsWithoutAttendanceList - Students without attendance
 * @returns {Array} - Merged and sorted students array
 */
export const mergeAndSortStudents = (attendanceByStudentAndWeek, studentsWithoutAttendanceList = []) => {
    // Students with attendance data
    const studentsWithAttendance = Object.values(attendanceByStudentAndWeek);
    
    // Students without attendance data
    const studentsWithoutAttendance = studentsWithoutAttendanceList.map(student => ({
        student: student,
        attendance: {} // Empty attendance object
    }));

    // Combine and sort all students
    const allStudents = [...studentsWithAttendance, ...studentsWithoutAttendance];
    const sortedStudents = sortStudentsByLastName(allStudents.map(s => s.student)).map(student => {
        // Find the corresponding student data
        return allStudents.find(s => s.student.id === student.id);
    });

    return sortedStudents;
};

/**
 * Get sorted columns (last 3) or default columns
 * @param {Map} allWeeks - All weeks map
 * @param {Object} filters - Filters for default columns
 * @returns {Array} - Array of [columnKey, columnInfo] pairs
 */
export const getSortedColumns = (allWeeks, filters) => {
    if (allWeeks.size > 0) {
        return Array.from(allWeeks.entries())
            .sort(([, a], [, b]) => new Date(a.date) - new Date(b.date))
            .slice(-3);
    } else {
        return createDefaultColumns(filters);
    }
};

/**
 * Get class name from students data
 * @param {Array} displayStudents - Students to display
 * @param {Array} studentsWithoutAttendanceList - Students without attendance
 * @returns {string} - Class name or fallback
 */
export const getClassName = (displayStudents, studentsWithoutAttendanceList = []) => {
    if (displayStudents.length > 0 && displayStudents[0].student.class?.name) {
        return displayStudents[0].student.class.name;
    } else if (studentsWithoutAttendanceList.length > 0 && studentsWithoutAttendanceList[0].className) {
        return studentsWithoutAttendanceList[0].className;
    }
    return 'Không xác định';
};

/**
 * Parse student name into parts
 * @param {string} fullName - Full name string
 * @returns {Object} - { firstName, lastAndMiddleName }
 */
export const parseStudentName = (fullName) => {
    const nameParts = (fullName || '').trim().split(' ');
    const firstName = nameParts[nameParts.length - 1] || '';
    const lastAndMiddleName = nameParts.slice(0, -1).join(' ') || '';
    
    return { firstName, lastAndMiddleName };
};