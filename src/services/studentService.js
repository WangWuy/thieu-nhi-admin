import apiService from './api.js';
import importService from './importService.js';

export const studentService = {
    // Basic CRUD operations
    async getStudents(params = {}) {
        return apiService.get('/students', params);
    },

    async getStudentById(id) {
        return apiService.get(`/students/${id}`);
    },

    async createStudent(studentData) {
        return apiService.post('/students', studentData);
    },

    async updateStudent(id, studentData) {
        return apiService.put(`/students/${id}`, studentData);
    },

    async uploadStudentAvatar(id, file, onProgress = null) {
        const formData = new FormData();
        formData.append('avatar', file);
        return apiService.upload(`/students/${id}/avatar`, formData, onProgress);
    },

    async deleteStudent(id) {
        return apiService.delete(`/students/${id}`);
    },

    async getStudentsByClass(classId, includeScores = false) {
        const params = { includeScores: includeScores.toString() };
        return apiService.get(`/classes/${classId}/students`, params);
    },

    // ✅ FIXED: Dùng apiService thay vì api
    async restoreStudent(studentId) {
        return apiService.put(`/students/${studentId}/restore`);
    },

    // NEW: Score management operations
    async getStudentScoreDetails(id) {
        return apiService.get(`/students/${id}/score-details`);
    },

    async updateStudentScores(id, scoreData) {
        return apiService.put(`/students/${id}/scores`, scoreData);
    },

    async bulkUpdateScores(updates) {
        return apiService.post('/students/bulk-update-scores', { updates });
    },

    async getClassScoreStats(classId) {
        return apiService.get(`/classes/${classId}/score-stats`);
    },

    // Attendance history & stats
    async getStudentAttendanceHistory(id, params = {}) {
        return apiService.get(`/students/${id}/attendance/history`, params);
    },

    async getStudentAttendanceStats(id, params = {}) {
        return apiService.get(`/students/${id}/attendance/stats`, params);
    },

    // Import operations (delegated to importService)
    async importFromExcel(file, onProgress = null) {
        return importService.importStudentsFromExcel(file, onProgress);
    },

    async importFromJson(studentsData) {
        return importService.importStudentsFromJson(studentsData);
    },

    async parseExcelFile(file) {
        return importService.parseExcelFile(file, 'student');
    },

    async downloadTemplate() {
        return importService.downloadTemplate('student');
    },

    async validateImportData(studentsData) {
        return importService.validateImportData('student', studentsData);
    },

    // Bulk operations
    async bulkCreate(studentsData, onProgress = null) {
        // If it's a large dataset, use batch processing
        if (studentsData.length > 50) {
            return importService.batchImport('student', studentsData, onProgress);
        }

        // For smaller datasets, use regular API
        const results = {
            successful: [],
            failed: [],
            total: studentsData.length
        };

        for (const studentData of studentsData) {
            try {
                const result = await this.createStudent(studentData);
                results.successful.push({
                    data: studentData,
                    result
                });
            } catch (error) {
                results.failed.push({
                    data: studentData,
                    error: error.message
                });
            }
        }

        return { results };
    },

    async bulkUpdate(studentsData) {
        const results = {
            successful: [],
            failed: [],
            total: studentsData.length
        };

        for (const studentData of studentsData) {
            try {
                const { id, ...updateData } = studentData;
                const result = await this.updateStudent(id, updateData);
                results.successful.push({
                    data: studentData,
                    result
                });
            } catch (error) {
                results.failed.push({
                    data: studentData,
                    error: error.message
                });
            }
        }

        return { results };
    },

    // Export operations - UPDATED to include new score fields
    async exportToExcel(filters = {}) {
        try {
            // Get students data with filters
            const studentsResponse = await this.getStudents({
                ...filters,
                limit: 1000 // Get large batch for export
            });

            const students = studentsResponse.students || studentsResponse;

            // Convert to CSV format for download - UPDATED with new score fields
            const csvData = students.map(student => ({
                'Mã TN': student.studentCode,
                'Tên thánh': student.saintName || '',
                'Họ và tên': student.fullName,
                'Ngày sinh': student.birthDate ? new Date(student.birthDate).toLocaleDateString('vi-VN') : '',
                'Số điện thoại': student.phoneNumber || '',
                'SĐT Phụ huynh 1': student.parentPhone1 || '',
                'SĐT Phụ huynh 2': student.parentPhone2 || '',
                'Địa chỉ': student.address || '',
                'Lớp': student.class?.name || '',
                'Ngành': student.class?.department?.displayName || '',
                // NEW: Updated score fields
                'Số buổi T5': student.thursdayAttendanceCount || 0,
                'Số buổi CN': student.sundayAttendanceCount || 0,
                'Điểm điểm danh TB': student.attendanceAverage || 0,
                'Điểm 45\' HK1': student.study45Hk1 || 0,
                'Điểm thi HK1': student.examHk1 || 0,
                'Điểm 45\' HK2': student.study45Hk2 || 0,
                'Điểm thi HK2': student.examHk2 || 0,
                'Điểm giáo lý TB': student.studyAverage || 0,
                'Điểm tổng TB': student.finalAverage || 0,
                'Năm học': student.academicYear?.name || ''
            }));

            // Create and download CSV
            const headers = Object.keys(csvData[0] || {});
            const csvContent = [
                headers.join(','),
                ...csvData.map(row =>
                    headers.map(header =>
                        `"${(row[header] || '').toString().replace(/"/g, '""')}"`
                    ).join(',')
                )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            return {
                success: true,
                count: students.length,
                message: `Đã xuất ${students.length} học sinh`
            };

        } catch (error) {
            throw new Error(`Lỗi xuất file: ${error.message}`);
        }
    },

    // Statistics and analytics - UPDATED to include new score fields
    async getImportStats() {
        return importService.getImportStats();
    },

    async getStudentStats(filters = {}) {
        try {
            const students = await this.getStudents(filters);

            // Calculate basic statistics - UPDATED with new score fields
            const stats = {
                total: students.pagination?.total || students.length,
                byDepartment: {},
                byClass: {},
                byAcademicYear: {},
                // UPDATED: New score statistics
                averageAttendanceScore: 0,
                averageStudyScore: 0,
                averageFinalScore: 0,
                scoreDistribution: {
                    excellent: 0, // >= 8.5
                    good: 0,      // 7.0 - 8.4
                    average: 0,   // 5.5 - 6.9
                    weak: 0       // < 5.5
                }
            };

            if (students.students) {
                // Group by department
                students.students.forEach(student => {
                    const dept = student.class?.department?.displayName || 'Chưa phân ngành';
                    stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
                });

                // Group by class
                students.students.forEach(student => {
                    const className = student.class?.name || 'Chưa có lớp';
                    stats.byClass[className] = (stats.byClass[className] || 0) + 1;
                });

                // Group by academic year
                students.students.forEach(student => {
                    const academicYear = student.academicYear?.name || 'Chưa có năm học';
                    stats.byAcademicYear[academicYear] = (stats.byAcademicYear[academicYear] || 0) + 1;
                });

                // Calculate averages - UPDATED with new score fields
                const totalAttendance = students.students.reduce((sum, s) => sum + (parseFloat(s.attendanceAverage) || 0), 0);
                const totalStudy = students.students.reduce((sum, s) => sum + (parseFloat(s.studyAverage) || 0), 0);
                const totalFinal = students.students.reduce((sum, s) => sum + (parseFloat(s.finalAverage) || 0), 0);

                const studentCount = students.students.length;
                if (studentCount > 0) {
                    stats.averageAttendanceScore = (totalAttendance / studentCount).toFixed(1);
                    stats.averageStudyScore = (totalStudy / studentCount).toFixed(1);
                    stats.averageFinalScore = (totalFinal / studentCount).toFixed(1);

                    // Calculate score distribution based on final average
                    students.students.forEach(student => {
                        const finalScore = parseFloat(student.finalAverage) || 0;
                        if (finalScore >= 8.5) {
                            stats.scoreDistribution.excellent++;
                        } else if (finalScore >= 7.0) {
                            stats.scoreDistribution.good++;
                        } else if (finalScore >= 5.5) {
                            stats.scoreDistribution.average++;
                        } else {
                            stats.scoreDistribution.weak++;
                        }
                    });
                }
            }

            return stats;
        } catch (error) {
            throw new Error(`Lỗi lấy thống kê: ${error.message}`);
        }
    }
};

export default studentService;
