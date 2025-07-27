import { useState, useEffect } from 'react';
import { X, Save, UserPlus, UserMinus } from 'lucide-react';
import { classService } from '../../services/classService';
import { departmentService } from '../../services/departmentService';
import { userService } from '../../services/userService';

const ClassModal = ({ classItem, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        departmentId: ''
    });
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [assignedTeachers, setAssignedTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchDepartments();
            fetchTeachers();
            if (classItem) {
                setFormData({
                    name: classItem.name || '',
                    departmentId: classItem.departmentId || ''
                });
                setAssignedTeachers(classItem.classTeachers || []);
            } else {
                setFormData({
                    name: '',
                    departmentId: ''
                });
                setAssignedTeachers([]);
            }
            setError('');
        }
    }, [isOpen, classItem]);

    const fetchDepartments = async () => {
        try {
            const data = await departmentService.getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        }
    };

    const fetchTeachers = async () => {
        try {
            const data = await userService.getTeachers();
            setTeachers(data);
        } catch (err) {
            console.error('Failed to fetch teachers:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const submitData = { ...formData };
            if (submitData.departmentId) {
                submitData.departmentId = parseInt(submitData.departmentId);
            }

            if (classItem) {
                await classService.updateClass(classItem.id, submitData);
            } else {
                await classService.createClass(submitData);
            }

            onSave();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleAssignTeacher = async (teacherId, isPrimary = false) => {
        if (!classItem) {
            alert('Vui lòng tạo lớp trước khi phân công giáo lý viên');
            return;
        }

        try {
            await classService.assignTeacher(classItem.id, {
                userId: parseInt(teacherId),
                isPrimary
            });

            // Refresh assigned teachers
            const updatedClass = await classService.getClassById(classItem.id);
            setAssignedTeachers(updatedClass.classTeachers);
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    const handleRemoveTeacher = async (teacherId) => {
        if (!classItem) return;

        try {
            await classService.removeTeacher(classItem.id, teacherId);

            // Refresh assigned teachers
            const updatedClass = await classService.getClassById(classItem.id);
            setAssignedTeachers(updatedClass.classTeachers);
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    const availableTeachers = teachers.filter(teacher =>
        !assignedTeachers.some(at => at.userId === teacher.id)
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {classItem ? 'Chỉnh sửa lớp' : 'Thêm lớp mới'}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên lớp *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="VD: Chiên 1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngành *
                                </label>
                                <select
                                    name="departmentId"
                                    value={formData.departmentId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                        {/* Teacher Assignment (only for edit mode) */}
                        {classItem && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Phân công giáo lý viên</h3>

                                {/* Assigned Teachers */}
                                {assignedTeachers.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Giáo lý viên đã phân công:</h4>
                                        <div className="space-y-2">
                                            {assignedTeachers.map(at => (
                                                <div key={at.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-sm">
                                                                {at.user.fullName.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {at.user.saintName && `${at.user.saintName} `}{at.user.fullName}
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
                                                        onClick={() => handleRemoveTeacher(at.userId)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Gỡ bỏ"
                                                    >
                                                        <UserMinus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Available Teachers */}
                                {availableTeachers.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Giáo lý viên khả dụng:</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {availableTeachers.map(teacher => (
                                                <div key={teacher.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-sm">
                                                                {teacher.fullName.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {teacher.saintName && `${teacher.saintName} `}{teacher.fullName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {teacher.classTeachers?.length > 0
                                                                    ? `Đang dạy: ${teacher.classTeachers.map(ct => ct.class.name).join(', ')}`
                                                                    : 'Chưa có lớp'
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAssignTeacher(teacher.id, false)}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                                            title="Phân công"
                                                        >
                                                            Phụ
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAssignTeacher(teacher.id, true)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
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
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {classItem ? 'Cập nhật' : 'Tạo mới'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassModal;