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

    async deleteStudent(id) {
        return apiService.delete(`/students/${id}`);
    },

    async getStudentsByClass(classId) {
        return apiService.get(`/classes/${classId}/students`);
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

    // Export operations
    async exportToExcel(filters = {}) {
        try {
            // Get students data with filters
            const studentsResponse = await this.getStudents({
                ...filters,
                limit: 1000 // Get large batch for export
            });

            const students = studentsResponse.students || studentsResponse;

            // Convert to CSV format for download
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
                'Điểm chuyên cần': student.attendanceScore || 0,
                'Điểm giáo lý': student.studyScore || 0
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

    // Statistics and analytics
    async getImportStats() {
        return importService.getImportStats();
    },

    async getStudentStats(filters = {}) {
        try {
            const students = await this.getStudents(filters);

            // Calculate basic statistics
            const stats = {
                total: students.pagination?.total || students.length,
                byDepartment: {},
                byClass: {},
                averageAttendanceScore: 0,
                averageStudyScore: 0
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

                // Calculate averages
                const totalAttendance = students.students.reduce((sum, s) => sum + (s.attendanceScore || 0), 0);
                const totalStudy = students.students.reduce((sum, s) => sum + (s.studyScore || 0), 0);

                stats.averageAttendanceScore = students.students.length > 0
                    ? (totalAttendance / students.students.length).toFixed(1)
                    : 0;
                stats.averageStudyScore = students.students.length > 0
                    ? (totalStudy / students.students.length).toFixed(1)
                    : 0;
            }

            return stats;
        } catch (error) {
            throw new Error(`Lỗi lấy thống kê: ${error.message}`);
        }
    }
};

export default studentService;