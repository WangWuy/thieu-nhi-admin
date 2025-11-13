import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Search, UserMinus } from 'lucide-react';
import { classService } from '../../services/classService';
import { departmentService } from '../../services/departmentService';
import { userService } from '../../services/userService';

const createEmptyFormState = () => ({
    name: '',
    departmentId: ''
});

const ClassFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState(createEmptyFormState());
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [assignedTeachers, setAssignedTeachers] = useState([]);
    const [teacherSearch, setTeacherSearch] = useState('');
    const [pageLoading, setPageLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [teacherActionLoading, setTeacherActionLoading] = useState(false);

    const loadClassDetails = useCallback(async () => {
        if (!isEditMode) {
            setFormData(createEmptyFormState());
            setAssignedTeachers([]);
            return;
        }

        const classData = await classService.getClassById(id);
        setFormData({
            name: classData.name || '',
            departmentId: classData.departmentId ? String(classData.departmentId) : ''
        });
        setAssignedTeachers(classData.classTeachers || []);
    }, [id, isEditMode]);

    const loadInitialData = useCallback(async () => {
        setPageLoading(true);
        setPageError('');
        setFormError('');

        try {
            const [deptData, teacherData] = await Promise.all([
                departmentService.getDepartments(),
                userService.getTeachers()
            ]);

            setDepartments(deptData);
            setTeachers(teacherData);
            setTeacherSearch('');
            await loadClassDetails();
        } catch (error) {
            console.error('Failed to load class form data:', error);
            setPageError(error.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setPageLoading(false);
        }
    }, [loadClassDetails]);

    const refreshAssignedTeachers = useCallback(async () => {
        if (!isEditMode) return;

        try {
            const updatedClass = await classService.getClassById(id);
            setAssignedTeachers(updatedClass.classTeachers || []);
        } catch (error) {
            console.error('Failed to refresh assigned teachers:', error);
            setPageError(error.message || 'Không thể cập nhật danh sách giáo lý viên.');
        }
    }, [id, isEditMode]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formError) setFormError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');

        const trimmedName = formData.name.trim();
        if (!trimmedName) {
            setFormError('Vui lòng nhập tên lớp.');
            return;
        }

        const payload = {
            name: trimmedName,
            departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null
        };

        setSaving(true);
        try {
            const savedClass = isEditMode
                ? await classService.updateClass(id, payload)
                : await classService.createClass(payload);

            if (!isEditMode && savedClass?.id) {
                navigate(`/classes/${savedClass.id}/edit`, { replace: true });
                return;
            }

            navigate('/classes');
        } catch (error) {
            console.error('Failed to save class:', error);
            setFormError(error.message || 'Không thể lưu lớp. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleAssignTeacher = async (teacherId, isPrimary = false) => {
        if (!isEditMode) {
            alert('Vui lòng lưu lớp trước khi phân công giáo lý viên.');
            return;
        }

        setTeacherActionLoading(true);
        try {
            await classService.assignTeacher(id, {
                userId: parseInt(teacherId, 10),
                isPrimary
            });
            await refreshAssignedTeachers();
        } catch (error) {
            console.error('Failed to assign teacher:', error);
            alert(error.message || 'Không thể phân công giáo lý viên.');
        } finally {
            setTeacherActionLoading(false);
        }
    };

    const handleRemoveTeacher = async (teacherId) => {
        if (!isEditMode) return;

        setTeacherActionLoading(true);
        try {
            await classService.removeTeacher(id, teacherId);
            await refreshAssignedTeachers();
        } catch (error) {
            console.error('Failed to remove teacher:', error);
            alert(error.message || 'Không thể gỡ giáo lý viên.');
        } finally {
            setTeacherActionLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-red-100 rounded w-1/3 animate-pulse"></div>
                <div className="h-96 bg-red-100 rounded animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-800"
            >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
            </button>

            {pageError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between gap-4">
                    <span>{pageError}</span>
                    <button
                        type="button"
                        onClick={loadInitialData}
                        className="text-red-700 underline text-sm"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-red-100">
                <div className="border-b border-red-100 px-6 py-4">
                    <h1 className="text-xl font-semibold text-red-800">
                        {isEditMode ? 'Chỉnh sửa lớp' : 'Thêm lớp mới'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý thông tin lớp và phân công giáo lý viên.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {formError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên lớp *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="VD: Chiên 1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngành *
                            </label>
                            <select
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Chọn ngành</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/classes')}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {isEditMode ? (
                <TeacherAssignmentPanel
                    teachers={teachers}
                    assignedTeachers={assignedTeachers}
                    teacherSearch={teacherSearch}
                    onSearchChange={setTeacherSearch}
                    onAssignTeacher={handleAssignTeacher}
                    onRemoveTeacher={handleRemoveTeacher}
                    disabled={teacherActionLoading}
                />
            ) : (
                <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-lg">
                    Sau khi tạo lớp, bạn có thể quay lại trang này để phân công giáo lý viên.
                </div>
            )}
        </div>
    );
};

const TeacherAssignmentPanel = ({
    teachers,
    assignedTeachers,
    teacherSearch,
    onSearchChange,
    onAssignTeacher,
    onRemoveTeacher,
    disabled
}) => {
    const normalizedSearch = teacherSearch.trim().toLowerCase();

    const availableTeachers = teachers.filter(teacher => {
        const alreadyAssigned = assignedTeachers.some(at => at.userId === teacher.id);
        if (alreadyAssigned) return false;

        if (!normalizedSearch) return true;
        const fullName = teacher.fullName?.toLowerCase() || '';
        const saintName = teacher.saintName?.toLowerCase() || '';
        return fullName.includes(normalizedSearch) || saintName.includes(normalizedSearch);
    });

    const filteredAssignedTeachers = assignedTeachers.filter(at => {
        if (!normalizedSearch) return true;
        const fullName = at.user?.fullName?.toLowerCase() || '';
        const saintName = at.user?.saintName?.toLowerCase() || '';
        return fullName.includes(normalizedSearch) || saintName.includes(normalizedSearch);
    });

    const getInitial = (name = '') => name.charAt(0)?.toUpperCase() || '?';

    return (
        <div className="bg-white rounded-lg shadow-sm border border-red-100">
            <div className="border-b border-red-100 px-6 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-red-800">Phân công giáo lý viên</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Tìm kiếm và phân công giáo lý viên cho lớp này.
                    </p>
                </div>
                {disabled && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        Đang cập nhật...
                    </div>
                )}
            </div>

            <div className="p-6 space-y-6">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm giáo lý viên..."
                        value={teacherSearch}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 search-input"
                    />
                </div>

                {assignedTeachers.length > 0 ? (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Giáo lý viên đã phân công ({assignedTeachers.length})
                        </h3>
                        <div className="space-y-2">
                            {filteredAssignedTeachers.map(at => (
                                <div key={at.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                                            {at.user?.avatarUrl ? (
                                                <img
                                                    src={at.user.avatarUrl}
                                                    alt={at.user?.fullName || 'User'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white text-sm">
                                                    {getInitial(at.user?.fullName)}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-red-800">
                                                {at.user?.saintName ? `${at.user.saintName} ` : ''}{at.user?.fullName}
                                            </div>
                                            {at.isPrimary && (
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                    Giáo lý viên chính
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveTeacher(at.userId)}
                                        disabled={disabled}
                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                        title="Gỡ bỏ"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {normalizedSearch && filteredAssignedTeachers.length === 0 && (
                            <div className="text-sm text-gray-500 text-center py-4">
                                Không tìm thấy giáo lý viên đã phân công phù hợp
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
                        Chưa phân công giáo lý viên nào.
                    </div>
                )}

                {availableTeachers.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Giáo lý viên khả dụng ({availableTeachers.length})
                        </h3>
                        <div className="space-y-2 overflow-y-auto pr-1">
                            {availableTeachers.map(teacher => (
                                <div key={teacher.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center overflow-hidden">
                                            {teacher.avatarUrl ? (
                                                <img
                                                    src={teacher.avatarUrl}
                                                    alt={teacher.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white text-sm">
                                                    {getInitial(teacher.fullName)}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-red-700">
                                                {teacher.saintName ? `${teacher.saintName} ` : ''}{teacher.fullName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {teacher.classTeachers?.length > 0
                                                    ? `Đang dạy: ${teacher.classTeachers.map(ct => ct.class?.name).join(', ')}`
                                                    : 'Chưa có lớp'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onAssignTeacher(teacher.id, false)}
                                            disabled={disabled}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded text-sm"
                                            title="Phân công làm giáo lý viên phụ"
                                        >
                                            Phụ
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onAssignTeacher(teacher.id, true)}
                                            disabled={disabled}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded text-sm"
                                            title="Phân công làm giáo lý viên chính"
                                        >
                                            Chính
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {normalizedSearch && availableTeachers.length === 0 && teachers.length > 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                        Không tìm thấy giáo lý viên khả dụng phù hợp
                    </div>
                )}

                {teachers.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                        Chưa có giáo lý viên trong hệ thống
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassFormPage;