import React, { useState, useEffect } from 'react';
import { User, Award, Calculator } from 'lucide-react';

const StudentForm = ({ student = null, isOpen, onClose, onSave, classes = [] }) => {
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
        // Score fields
        study45Hk1: 0,
        examHk1: 0,
        study45Hk2: 0,
        examHk2: 0
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
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
                // Score fields
                study45Hk1: student.study45Hk1 || 0,
                examHk1: student.examHk1 || 0,
                study45Hk2: student.study45Hk2 || 0,
                examHk2: student.examHk2 || 0
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
                // Score fields
                study45Hk1: 0,
                examHk1: 0,
                study45Hk2: 0,
                examHk2: 0
            });
        }
        setErrors({});
    }, [student, isOpen]);

    // Calculate study average preview
    const calculateStudyAverage = () => {
        const { study45Hk1, examHk1, study45Hk2, examHk2 } = formData;
        const total = parseFloat(study45Hk1) + parseFloat(study45Hk2) + 
                     (parseFloat(examHk1) * 2) + (parseFloat(examHk2) * 2);
        return (total / 6).toFixed(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!formData.studentCode) newErrors.studentCode = 'Mã thiếu nhi là bắt buộc';
        if (!formData.fullName) newErrors.fullName = 'Họ tên là bắt buộc';
        if (!formData.classId) newErrors.classId = 'Lớp là bắt buộc';

        // Score validation
        const scoreFields = ['study45Hk1', 'examHk1', 'study45Hk2', 'examHk2'];
        scoreFields.forEach(field => {
            const value = parseFloat(formData[field]);
            if (value < 0 || value > 10) {
                newErrors[field] = 'Điểm phải từ 0 đến 10';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {student ? 'Chỉnh sửa thiếu nhi' : 'Thêm thiếu nhi'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Thông tin cơ bản
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Mã thiếu nhi *</label>
                                <input
                                    type="text"
                                    value={formData.studentCode}
                                    onChange={(e) => handleChange('studentCode', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="VD: TN0001"
                                />
                                {errors.studentCode && <p className="text-red-600 text-xs mt-1">{errors.studentCode}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Lớp *</label>
                                <select
                                    value={formData.classId}
                                    onChange={(e) => handleChange('classId', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Chọn lớp</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.department?.displayName})
                                        </option>
                                    ))}
                                </select>
                                {errors.classId && <p className="text-red-600 text-xs mt-1">{errors.classId}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Tên thánh</label>
                                <input
                                    type="text"
                                    value={formData.saintName}
                                    onChange={(e) => handleChange('saintName', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="VD: Maria"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="VD: Nguyễn Văn A"
                                />
                                {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                                <input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) => handleChange('birthDate', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">SĐT thiếu nhi</label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0901234567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">SĐT phụ huynh 1</label>
                                <input
                                    type="tel"
                                    value={formData.parentPhone1}
                                    onChange={(e) => handleChange('parentPhone1', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0901234567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">SĐT phụ huynh 2</label>
                                <input
                                    type="tel"
                                    value={formData.parentPhone2}
                                    onChange={(e) => handleChange('parentPhone2', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0901234567"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={2}
                                    placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Score Information */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-blue-600" />
                            Điểm số giáo lý
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Học kỳ 1 */}
                            <div className="bg-white p-4 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-800 mb-3">Học kỳ 1</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Điểm 45 phút</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={formData.study45Hk1}
                                            onChange={(e) => handleChange('study45Hk1', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0.0"
                                        />
                                        {errors.study45Hk1 && <p className="text-red-600 text-xs mt-1">{errors.study45Hk1}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Điểm thi (×2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={formData.examHk1}
                                            onChange={(e) => handleChange('examHk1', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0.0"
                                        />
                                        {errors.examHk1 && <p className="text-red-600 text-xs mt-1">{errors.examHk1}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Học kỳ 2 */}
                            <div className="bg-white p-4 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-800 mb-3">Học kỳ 2</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Điểm 45 phút</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={formData.study45Hk2}
                                            onChange={(e) => handleChange('study45Hk2', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0.0"
                                        />
                                        {errors.study45Hk2 && <p className="text-red-600 text-xs mt-1">{errors.study45Hk2}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Điểm thi (×2)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={formData.examHk2}
                                            onChange={(e) => handleChange('examHk2', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0.0"
                                        />
                                        {errors.examHk2 && <p className="text-red-600 text-xs mt-1">{errors.examHk2}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Score Preview */}
                        <div className="mt-4 bg-white p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Calculator className="w-4 h-4 text-blue-600" />
                                <h4 className="font-medium text-blue-800">Điểm trung bình (dự kiến)</h4>
                            </div>
                            <div className="text-2xl font-bold text-blue-700">
                                {calculateStudyAverage()}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                                Công thức: (45' HK1 + 45' HK2 + Thi HK1×2 + Thi HK2×2) ÷ 6
                            </div>
                        </div>

                        {/* Note about other scores */}
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="text-sm text-yellow-800">
                                <strong>Lưu ý:</strong> Điểm điểm danh và điểm tổng sẽ được tính tự động dựa trên:
                                <ul className="list-disc list-inside mt-1 text-xs">
                                    <li>Điểm điểm danh: Từ việc điểm danh thứ 5 và chủ nhật</li>
                                    <li>Điểm tổng: Điểm giáo lý × 0.6 + Điểm điểm danh × 0.4</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {errors.submit}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <User className="w-4 h-4" />
                                    {student ? 'Cập nhật' : 'Thêm'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;