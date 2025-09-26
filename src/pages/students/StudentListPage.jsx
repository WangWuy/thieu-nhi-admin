import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, GraduationCap, Upload, ChevronLeft, ChevronRight, Save, X, Award, Search, ArrowLeft, RotateCcw } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { authService } from '../../services/authService';
import StudentForm from '../../components/students/StudentForm';
import ExcelImportModal from '../../components/import/ExcelImportModal';

const StudentListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        classFilter: searchParams.get('classId') || '',
        isActiveFilter: '',
        page: 1,
        limit: 45
    });
    const [pagination, setPagination] = useState({});
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // Score editing states
    const [editingScores, setEditingScores] = useState({});
    const [savingScores, setSavingScores] = useState({});

    const [searchInput, setSearchInput] = useState('');

    // ✅ Track loading states to prevent duplicate calls
    const [userLoaded, setUserLoaded] = useState(false);
    const [classesLoaded, setClassesLoaded] = useState(false);

    // ✅ Load user ONCE on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                // Fast: get from localStorage first
                let user = authService.getCurrentUserSync();
                if (user) {
                    setCurrentUser(user);
                    setUserLoaded(true);
                }

                // Then update from API if needed
                if (!user) {
                    user = await authService.getCurrentUser();
                    if (user) {
                        setCurrentUser(user);
                    }
                }
                setUserLoaded(true);
            } catch (error) {
                console.error('Load user error:', error);
                setUserLoaded(true);
            }
        };

        loadUser();
    }, []); // Only run once

    // ✅ Load classes AFTER user is loaded
    useEffect(() => {
        if (!userLoaded || !currentUser || classesLoaded) return;

        const loadClasses = async () => {
            if (currentUser.role === 'giao_ly_vien') {
                // GLV: chỉ show assigned class
                if (currentUser.assignedClass) {
                    setClasses([currentUser.assignedClass]);
                    setFilters(prev => ({
                        ...prev,
                        classFilter: currentUser.assignedClass.id.toString()
                    }));
                } else {
                    setClasses([]);
                }
            } else {
                // Admin/PDT: fetch all classes
                try {
                    const data = await classService.getClasses();
                    setClasses(data);
                } catch (err) {
                    console.error('Failed to fetch classes:', err);
                    setClasses([]);
                }
            }
            setClassesLoaded(true);
        };

        loadClasses();
    }, [userLoaded, currentUser, classesLoaded]);

    // Remove the old handleUserLoaded function and fetchClasses function

    // ✅ Sync searchInput with filters.search
    useEffect(() => {
        setSearchInput(filters.search);
    }, [filters.search]);

    // ✅ Update URL params when classFilter changes
    useEffect(() => {
        const classIdFromUrl = searchParams.get('classId');
        if (classIdFromUrl && classIdFromUrl !== filters.classFilter) {
            setFilters(prev => ({ ...prev, classFilter: classIdFromUrl }));
        }
    }, [searchParams]);

    // ✅ Fetch students when filters change AND both user + classes are loaded
    useEffect(() => {
        if (userLoaded && classesLoaded && currentUser) {
            fetchStudents();
        }
    }, [filters, userLoaded, classesLoaded, currentUser]);

    // ✅ Update selected class when classFilter changes
    useEffect(() => {
        if (filters.classFilter && classes.length > 0) {
            const foundClass = classes.find(cls => cls.id === parseInt(filters.classFilter));
            setSelectedClass(foundClass);
        } else {
            setSelectedClass(null);
        }
    }, [filters.classFilter, classes]);

    const fetchStudents = async () => {
        if (!userLoaded || !classesLoaded || !currentUser) return;

        try {
            setLoading(true);
            // Build query params
            const queryParams = { ...filters };

            // Handle isActive filter
            if (filters.isActiveFilter !== '') {
                queryParams.isActive = filters.isActiveFilter;
            }
            delete queryParams.isActiveFilter;

            const response = await studentService.getStudents(queryParams);

            // ✅ Client-side filter for GLV
            let filteredStudents = response.students;
            if (currentUser?.role === 'giao_ly_vien' && currentUser.assignedClass) {
                filteredStudents = response.students.filter(
                    student => student.classId === currentUser.assignedClass.id
                );
            }

            setStudents(filteredStudents);
            setPagination(response.pagination);
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setFilters(prev => ({
            ...prev,
            search: searchInput.trim(),
            page: 1
        }));
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit(e);
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

    const handleClassFilterChange = (classId) => {
        setFilters(prev => ({ ...prev, classFilter: classId, page: 1 }));

        // Update URL params
        if (classId) {
            setSearchParams({ classId });
        } else {
            setSearchParams({});
        }
    };

    const clearClassFilter = () => {
        handleClassFilterChange('');
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

    const handleRestoreStudent = async (studentId) => {
        if (!confirm('Bạn có chắc muốn khôi phục thiếu nhi này?')) return;
        try {
            await studentService.restoreStudent(studentId);
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

            setStudents(prev => prev.map(student => {
                if (student.id === studentId) {
                    return {
                        ...student,
                        ...scoreData,
                    };
                }
                return student;
            }));

            cancelEditingScores(studentId);
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

    const parseStudentName = (saintName, fullName) => {
        if (!fullName) return { saintNameWithMiddleName: '', firstName: '' };

        const words = fullName.trim().split(' ');
        if (words.length === 0) return { saintNameWithMiddleName: '', firstName: '' };

        // Tên là từ cuối cùng
        const firstName = words[words.length - 1];

        // Họ và tên lót là các từ còn lại
        const middleName = words.slice(0, -1).join(' ');

        // Tên thánh + họ tên lót
        const saintNameWithMiddleName = saintName ? `${saintName} ${middleName}`.trim() : middleName;

        return {
            saintNameWithMiddleName,
            firstName
        };
    };

    if (loading && !currentUser) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Class Filter Banner */}
            {selectedClass && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            <div>
                                <span className="text-sm text-blue-600">Đang xem lớp:</span>
                                <span className="ml-2 text-lg font-semibold text-blue-800">
                                    {selectedClass.name}
                                </span>
                                <span className="ml-2 text-sm text-blue-600">
                                    ({selectedClass.department?.displayName})
                                </span>
                            </div>
                        </div>
                        {/* Chỉ admin/PDT mới có nút "Xem tất cả lớp" */}
                        {currentUser?.role !== 'giao_ly_vien' && (
                            <button
                                onClick={clearClassFilter}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Xem tất cả lớp
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* GLV chưa có lớp - Warning */}
            {currentUser?.role === 'giao_ly_vien' && !currentUser.assignedClass && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">!</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-yellow-800">
                                Chưa được phân công lớp
                            </h3>
                            <p className="text-yellow-700 text-sm">
                                Vui lòng liên hệ Ban Điều Hành để được phân công lớp học
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters & Actions */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, mã thiếu nhi..."
                                value={searchInput}
                                onChange={handleSearchInputChange}
                                onKeyPress={handleSearchKeyPress}
                                className="w-full pl-11 pr-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 search-input"
                            />
                        </form>
                    </div>
                    <select
                        value={filters.classFilter}
                        onChange={(e) => handleClassFilterChange(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                        disabled={currentUser?.role === 'giao_ly_vien'}
                    >
                        <option value="">
                            {currentUser?.role === 'giao_ly_vien' && classes.length === 0
                                ? 'Chưa được phân công lớp'
                                : 'Tất cả lớp'
                            }
                        </option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>
                    <select
                        value={filters.isActiveFilter}
                        onChange={(e) => setFilters(prev => ({ ...prev, isActiveFilter: e.target.value, page: 1 }))}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="true">Đang học</option>
                        <option value="false">Đã xóa</option>
                    </select>
                    <div className="flex gap-2">
                        {(currentUser?.role !== 'giao_ly_vien' || currentUser?.assignedClass) && (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Student Table with Scores */}
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Tên thánh + Họ
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Tên
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Lớp / Tuổi
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Liên hệ
                            </th>

                            {/* Score columns */}
                            <th className="px-2 py-3 text-center text-xs font-medium text-blue-600 uppercase border-l border-blue-200">
                                <div className="flex flex-col items-center">
                                    <span>45' HK1</span>
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center text-xs font-medium text-blue-600 uppercase">
                                <div className="flex flex-col items-center">
                                    <span>Thi HK1</span>
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center text-xs font-medium text-blue-600 uppercase">
                                <div className="flex flex-col items-center">
                                    <span>45' HK2</span>
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center text-xs font-medium text-blue-600 uppercase">
                                <div className="flex flex-col items-center">
                                    <span>Thi HK2</span>
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center text-xs font-medium text-blue-600 uppercase">
                                <div className="flex flex-col items-center">
                                    <span>TB Giáo lý</span>
                                    <span className="text-[10px] font-normal">(Tự động)</span>
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center text-xs font-medium text-green-600 uppercase">
                                <div className="flex flex-col items-center">
                                    <span>Điểm danh T5</span>
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center text-xs font-medium text-green-600 uppercase">
                                <div className="flex flex-col items-center">
                                    <span>Điểm danh CN</span>
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center text-xs font-medium text-green-600 uppercase">
                                <div className="flex flex-col items-center">
                                    <span>TB Điểm danh</span>
                                    <span className="text-[10px] font-normal">(Tự động)</span>
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center text-xs font-medium text-purple-600 uppercase">
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
                            const { saintNameWithMiddleName, firstName } = parseStudentName(student.saintName, student.fullName);

                            return (
                                <tr key={student.id} className={`hover:bg-gray-50 ${isEditingThisStudent ? 'bg-blue-50' : ''} ${!student.isActive ? 'bg-red-50 opacity-75' : ''}`}>
                                    {/* Cột Tên thánh + Họ lót */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!student.isActive ? 'bg-gray-400' : 'bg-blue-600'}`}>
                                                <GraduationCap className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="ml-3">
                                                <div className={`text-sm font-medium ${!student.isActive ? 'text-gray-500' : 'text-gray-900'}`}>
                                                    {saintNameWithMiddleName}
                                                    {!student.isActive && <span className="ml-2 text-xs text-red-600 font-semibold">(Đã xóa)</span>}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {student.studentCode}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Cột Tên */}
                                    <td className="px-3 py-4 align-top">
                                        <div className={`text-sm font-medium mt-1 ${!student.isActive ? 'text-gray-500' : 'text-gray-900'}`}>
                                            {firstName}
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
                                    {/* Score columns - Individual cells */}
                                    <td className="px-2 py-4 text-center border-l border-blue-100">
                                        <ScoreEditCell
                                            studentId={student.id}
                                            field="study45Hk1"
                                            value={student.study45Hk1}
                                            label="45' HK1"
                                        />
                                    </td>
                                    <td className="px-2 py-4 text-center">
                                        <ScoreEditCell
                                            studentId={student.id}
                                            field="examHk1"
                                            value={student.examHk1}
                                            label="Thi HK1"
                                        />
                                    </td>
                                    <td className="px-2 py-4 text-center">
                                        <ScoreEditCell
                                            studentId={student.id}
                                            field="study45Hk2"
                                            value={student.study45Hk2}
                                            label="45' HK2"
                                        />
                                    </td>
                                    <td className="px-2 py-4 text-center">
                                        <ScoreEditCell
                                            studentId={student.id}
                                            field="examHk2"
                                            value={student.examHk2}
                                            label="Thi HK2"
                                        />
                                    </td>
                                    <td className="px-2 py-4 text-center bg-blue-50">
                                        <div className="text-sm font-bold text-blue-700">
                                            {parseFloat(student.studyAverage || 0).toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-2 py-4 text-center bg-green-50">
                                        <div className="text-sm font-medium text-green-700">
                                            {student.thursdayAttendanceCount || 0}
                                        </div>
                                    </td>
                                    <td className="px-2 py-4 text-center bg-green-50">
                                        <div className="text-sm font-medium text-green-700">
                                            {student.sundayAttendanceCount || 0}
                                        </div>
                                    </td>
                                    <td className="px-2 py-4 text-center bg-green-50">
                                        <div className="text-sm font-bold text-green-700">
                                            {parseFloat(student.attendanceAverage || 0).toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-2 py-4 text-center bg-purple-50">
                                        <div className="text-lg font-bold text-purple-700">
                                            {parseFloat(student.finalAverage || 0).toFixed(2)}
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
                                                        disabled={!student.isActive}
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
                                                        disabled={!student.isActive}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {student.isActive ? (
                                                        <button
                                                            onClick={() => handleDeleteStudent(student.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRestoreStudent(student.id)}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Khôi phục"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    )}
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
                    <div className="text-gray-500 mb-4">
                        {/* GLV chưa được phân công lớp */}
                        {currentUser?.role === 'giao_ly_vien' && !currentUser.assignedClass ? (
                            'Bạn chưa được phân công lớp nào'
                        ) :
                            /* Đang xem thiếu nhi đã nghỉ */
                            filters.isActiveFilter === 'false' ? (
                                'Hiện tại không có thiếu nhi nào đã nghỉ'
                            ) :
                                /* Nếu có searchInput thì ưu tiên hiện thông báo tìm kiếm */
                                searchInput.length > 0 ? (
                                    'Không tìm thấy thiếu nhi nào'
                                ) :
                                    /* Đang filter theo lớp cụ thể */
                                    selectedClass ? (
                                        `Không có thiếu nhi nào trong lớp ${selectedClass.name}`
                                    ) : (
                                        'Không tìm thấy thiếu nhi nào'
                                    )}
                    </div>
                </div>
            )}


            {/* Modals */}
            <StudentForm
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSave={handleCreateStudent}
                classes={classes}
                defaultClassId={filters.classFilter}
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