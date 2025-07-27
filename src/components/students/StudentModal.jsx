import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';

const StudentModal = ({ student, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        studentCode: '',
        saintName: '',
        fullName: '',
        birthDate: '',
        phoneNumber: '',
        parentPhone1: '',
        parentPhone2: '',
        address: '',
        classId: '',
        attendanceScore: '0',
        studyScore: '0'
    });
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchClasses();
            if (student) {
                setFormData({
                    studentCode: student.studentCode || '',
                    saintName: student.saintName || '',
                    fullName: student.fullName || '',
                    birthDate: student.birthDate ? student.birthDate.split('T')[0] : '',
                    phoneNumber: student.phoneNumber || '',
                    parentPhone1: student.parentPhone1 || '',
                    parentPhone2: student.parentPhone2 || '',
                    address: student.address || '',
                    classId: student.classId || '',
                    attendanceScore: student.attendanceScore || '0',
                    studyScore: student.studyScore || '0'
                });
            } else {
                setFormData({
                    studentCode: '',
                    saintName: '',
                    fullName: '',
                    birthDate: '',
                    phoneNumber: '',
                    parentPhone1: '',
                    parentPhone2: '',
                    address: '',
                    classId: '',
                    attendanceScore: '0',
                    studyScore: '0'
                });
            }
            setError('');
        }
    }, [isOpen, student]);

    const fetchClasses = async () => {
        try {
            const data = await classService.getClasses();
            setClasses(data);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const submitData = { ...formData };

            // Convert empty strings to null
            Object.keys(submitData).forEach(key => {
                if (submitData[key] === '') {
                    submitData[key] = null;
                }
            });

            // Convert numeric fields
            if (submitData.classId) {
                submitData.classId = parseInt(submitData.classId);
            }
            if (submitData.attendanceScore) {
                submitData.attendanceScore = parseFloat(submitData.attendanceScore);
            }
            if (submitData.studyScore) {
                submitData.studyScore = parseFloat(submitData.studyScore);
            }

            if (student) {
                await studentService.updateStudent(student.id, submitData);
            } else {
                await studentService.createStudent(submitData);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {student ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
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
                                    Mã học sinh *
                                </label>
                                <input
                                    type="text"
                                    name="studentCode"
                                    value={formData.studentCode}
                                    onChange={handleChange}
                                    required
                                    placeholder="VD: TN0001"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lớp *
                                </label>
                                <select
                                    name="classId"
                                    value={formData.classId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Chọn lớp</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.department.displayName})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên Thánh
                                </label>
                                <input
                                    type="text"
                                    name="saintName"
                                    value={formData.saintName}
                                    onChange={handleChange}
                                    placeholder="VD: Maria"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="VD: Nguyễn Văn A"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Birth Date & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="VD: 0901234567"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Parent Phones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SĐT Phụ huynh 1
                                </label>
                                <input
                                    type="tel"
                                    name="parentPhone1"
                                    value={formData.parentPhone1}
                                    onChange={handleChange}
                                    placeholder="VD: 0901234567"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SĐT Phụ huynh 2
                                </label>
                                <input
                                    type="tel"
                                    name="parentPhone2"
                                    value={formData.parentPhone2}
                                    onChange={handleChange}
                                    placeholder="VD: 0901234567"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Scores */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Điểm chuyên cần
                                </label>
                                <input
                                    type="number"
                                    name="attendanceScore"
                                    value={formData.attendanceScore}
                                    onChange={handleChange}
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Điểm giáo lý
                                </label>
                                <input
                                    type="number"
                                    name="studyScore"
                                    value={formData.studyScore}
                                    onChange={handleChange}
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
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
                                    {student ? 'Cập nhật' : 'Tạo mới'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentModal;