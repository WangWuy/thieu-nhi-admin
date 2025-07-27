import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GraduationCap, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import StudentForm from './StudentForm';
import ExcelImportModal from '../import/ExcelImportModal';

const StudentListPage = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        classFilter: '',
        page: 1,
        limit: 20
    });
    const [pagination, setPagination] = useState({});
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [filters]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentService.getStudents(filters);
            setStudents(response.students);
            setPagination(response.pagination);
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const data = await classService.getClasses();
            setClasses(data);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
        }
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleCreateStudent = async (studentData) => {
        await studentService.createStudent(studentData);
        fetchStudents();
    };

    const handleEditStudent = async (studentData) => {
        await studentService.updateStudent(selectedStudent.id, studentData);
        fetchStudents();
    };

    const handleDeleteStudent = async (studentId) => {
        if (!confirm('Bạn có chắc muốn xóa thiếu nhi này?')) return;
        try {
            await studentService.deleteStudent(studentId);
            fetchStudents();
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    if (loading) {
        return <div className="p-4">Đang tải...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Filters & Actions */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <select
                        value={filters.classFilter}
                        onChange={(e) => setFilters(prev => ({ ...prev, classFilter: e.target.value, page: 1 }))}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="">Tất cả lớp</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Import
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm
                        </button>
                    </div>
                </div>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Thiếu nhi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Mã số
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Lớp / Tuổi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Liên hệ
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => {
                            const age = calculateAge(student.birthDate);
                            return (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                                <GraduationCap className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {student.saintName && `${student.saintName} `}{student.fullName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {student.birthDate ? new Date(student.birthDate).toLocaleDateString('vi-VN') : 'Chưa có ngày sinh'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{student.studentCode}</div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{student.class.name}</div>
                                        {age && <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">{age} tuổi</span>}
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="text-sm space-y-1">
                                            {student.parentPhone1 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-700 font-medium">SĐT 1:</span>
                                                    <span className="text-gray-900 font-semibold">{student.parentPhone1}</span>
                                                </div>
                                            )}
                                            {student.parentPhone2 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-700 font-medium">SĐT 2:</span>
                                                    <span className="text-gray-900 font-semibold">{student.parentPhone2}</span>
                                                </div>
                                            )}
                                            {student.phoneNumber && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-blue-700 font-medium">SĐT TN:</span>
                                                    <span className="text-blue-600 font-semibold">{student.phoneNumber}</span>
                                                </div>
                                            )}
                                            {!student.parentPhone1 && !student.parentPhone2 && !student.phoneNumber && (
                                                <span className="text-gray-400 italic">Chưa có SĐT</span>
                                            )}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} trong{' '}
                                {pagination.total} kết quả
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-700">
                                    {pagination.page} / {pagination.pages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {students.length === 0 && !loading && (
                <div className="text-center py-12">
                    <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500 mb-4">Không tìm thấy thiếu nhi nào</div>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            Thêm thiếu nhi mới
                        </button>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            Import từ Excel
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <StudentForm
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSave={handleCreateStudent}
                classes={classes}
            />

            <StudentForm
                student={selectedStudent}
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
                }}
                onSave={handleEditStudent}
                classes={classes}
            />

            <ExcelImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={fetchStudents}
            />
        </div>
    );
};

export default StudentListPage;