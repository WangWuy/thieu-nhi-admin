import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GraduationCap, Upload, ChevronLeft, ChevronRight, Save, X, Award } from 'lucide-react';
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
    
    // Score editing states
    const [editingScores, setEditingScores] = useState({}); // { studentId: { study45Hk1: value, ... } }
    const [savingScores, setSavingScores] = useState({}); // { studentId: true/false }

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

    // Score editing functions
    const startEditingScores = (studentId, currentScores) => {
        setEditingScores(prev => ({
            ...prev,
            [studentId]: {
                study45Hk1: currentScores.study45Hk1 || 0,
                examHk1: currentScores.examHk1 || 0,
                study45Hk2: currentScores.study45Hk2 || 0,
                examHk2: currentScores.examHk2 || 0
            }
        }));
    };

    const cancelEditingScores = (studentId) => {
        setEditingScores(prev => {
            const newState = { ...prev };
            delete newState[studentId];
            return newState;
        });
    };

    const updateScoreValue = (studentId, field, value) => {
        setEditingScores(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const saveScores = async (studentId) => {
        try {
            setSavingScores(prev => ({ ...prev, [studentId]: true }));
            
            const scoreData = editingScores[studentId];
            await studentService.updateStudentScores(studentId, scoreData);
            
            // Update local state
            setStudents(prev => prev.map(student => {
                if (student.id === studentId) {
                    return {
                        ...student,
                        ...scoreData,
                        // Điểm sẽ được tính lại ở backend
                    };
                }
                return student;
            }));

            // Cancel editing mode
            cancelEditingScores(studentId);
            
            // Refresh to get updated calculated scores
            fetchStudents();
        } catch (err) {
            alert('Lỗi khi lưu điểm: ' + err.message);
        } finally {
            setSavingScores(prev => ({ ...prev, [studentId]: false }));
        }
    };

    const ScoreEditCell = ({ studentId, field, value, label }) => {
        const isEditing = editingScores[studentId];
        
        if (isEditing) {
            return (
                <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={editingScores[studentId][field]}
                    onChange={(e) => updateScoreValue(studentId, field, parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.0"
                />
            );
        }

        return (
            <span className="text-sm font-medium text-gray-900">
                {parseFloat(value || 0).toFixed(1)}
            </span>
        );
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

            {/* Student Table with Scores */}
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Thiếu nhi
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Lớp / Tuổi
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Liên hệ
                            </th>
                            
                            {/* Score columns */}
                            <th className="px-3 py-3 text-center text-xs font-medium text-blue-600 uppercase border-l border-blue-200">
                                <div className="flex flex-col items-center">
                                    <Award className="w-4 h-4 mb-1" />
                                    <span>Điểm Giáo Lý</span>
                                </div>
                            </th>
                            <th className="px-3 py-3 text-center text-xs font-medium text-green-600 uppercase">
                                <div className="flex flex-col items-center">
                                    <span>Điểm danh</span>
                                    <span className="text-[10px] font-normal">(Tự động)</span>
                                </div>
                            </th>
                            <th className="px-3 py-3 text-center text-xs font-medium text-purple-600 uppercase">
                                <div className="flex flex-col items-center">
                                    <span>Tổng TB</span>
                                    <span className="text-[10px] font-normal">(Tự động)</span>
                                </div>
                            </th>
                            
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => {
                            const age = calculateAge(student.birthDate);
                            const isEditingThisStudent = editingScores[student.id];
                            const isSaving = savingScores[student.id];
                            
                            return (
                                <tr key={student.id} className={`hover:bg-gray-50 ${isEditingThisStudent ? 'bg-blue-50' : ''}`}>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                <GraduationCap className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {student.saintName && `${student.saintName} `}{student.fullName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {student.studentCode}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-3 py-4">
                                        <div className="text-sm font-medium text-gray-900">{student.class.name}</div>
                                        {age && <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">{age} tuổi</span>}
                                    </td>
                                    
                                    <td className="px-3 py-4">
                                        <div className="text-xs space-y-1">
                                            {student.parentPhone1 && (
                                                <div className="text-gray-900 font-medium">{student.parentPhone1}</div>
                                            )}
                                            {student.parentPhone2 && (
                                                <div className="text-gray-700">{student.parentPhone2}</div>
                                            )}
                                            {!student.parentPhone1 && !student.parentPhone2 && (
                                                <span className="text-gray-400 italic">Chưa có SĐT</span>
                                            )}
                                        </div>
                                    </td>
                                    
                                    {/* Score columns */}
                                    <td className="px-3 py-4 border-l border-blue-100">
                                        <div className="space-y-2">
                                            {/* Editable scores */}
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="text-center">
                                                    <div className="text-gray-600 mb-1">45' HK1</div>
                                                    <ScoreEditCell 
                                                        studentId={student.id}
                                                        field="study45Hk1"
                                                        value={student.study45Hk1}
                                                        label="45' HK1"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-gray-600 mb-1">Thi HK1</div>
                                                    <ScoreEditCell 
                                                        studentId={student.id}
                                                        field="examHk1"
                                                        value={student.examHk1}
                                                        label="Thi HK1"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-gray-600 mb-1">45' HK2</div>
                                                    <ScoreEditCell 
                                                        studentId={student.id}
                                                        field="study45Hk2"
                                                        value={student.study45Hk2}
                                                        label="45' HK2"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-gray-600 mb-1">Thi HK2</div>
                                                    <ScoreEditCell 
                                                        studentId={student.id}
                                                        field="examHk2"
                                                        value={student.examHk2}
                                                        label="Thi HK2"
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Study average (calculated) */}
                                            <div className="text-center pt-2 border-t border-blue-200">
                                                <div className="text-xs text-blue-600 font-medium">TB Giáo lý</div>
                                                <div className="text-sm font-bold text-blue-700">
                                                    {parseFloat(student.studyAverage || 0).toFixed(1)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-3 py-4 text-center">
                                        <div className="space-y-2">
                                            <div className="text-xs text-gray-600">
                                                T5: {student.thursdayAttendanceCount || 0} | CN: {student.sundayAttendanceCount || 0}
                                            </div>
                                            <div className="text-sm font-bold text-green-700">
                                                {parseFloat(student.attendanceAverage || 0).toFixed(1)}
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-3 py-4 text-center">
                                        <div className="text-lg font-bold text-purple-700">
                                            {parseFloat(student.finalAverage || 0).toFixed(1)}
                                        </div>
                                    </td>
                                    
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {isEditingThisStudent ? (
                                                <>
                                                    <button
                                                        onClick={() => saveScores(student.id)}
                                                        disabled={isSaving}
                                                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                                        title="Lưu điểm"
                                                    >
                                                        {isSaving ? (
                                                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <Save className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => cancelEditingScores(student.id)}
                                                        className="text-gray-600 hover:text-gray-800"
                                                        title="Hủy"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => startEditingScores(student.id, student)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Sửa điểm"
                                                    >
                                                        <Award className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setShowEditModal(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Sửa thông tin"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStudent(student.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
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