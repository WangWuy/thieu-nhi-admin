import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

const StudentForm = ({ student = null, isOpen, onClose, onSave, classes = [] }) => {
    const [formData, setFormData] = useState({
        studentCode: '',
        saintName: '',
        fullName: '',
        birthDate: '',
        parentPhone1: '',
        parentPhone2: '',
        address: '',
        classId: ''
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
                parentPhone1: student.parentPhone1 || '',
                parentPhone2: student.parentPhone2 || '',
                address: student.address || '',
                classId: student.classId || ''
            });
        } else {
            setFormData({
                studentCode: '',
                saintName: '',
                fullName: '',
                birthDate: '',
                parentPhone1: '',
                parentPhone2: '',
                address: '',
                classId: ''
            });
        }
        setErrors({});
    }, [student, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!formData.studentCode) newErrors.studentCode = 'Mã thiếu nhi là bắt buộc';
        if (!formData.fullName) newErrors.fullName = 'Họ tên là bắt buộc';
        if (!formData.classId) newErrors.classId = 'Lớp là bắt buộc';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {student ? 'Chỉnh sửa thiếu nhi' : 'Thêm thiếu nhi'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Mã thiếu nhi *</label>
                            <input
                                type="text"
                                value={formData.studentCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, studentCode: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="VD: TN0001"
                            />
                            {errors.studentCode && <p className="text-red-600 text-xs mt-1">{errors.studentCode}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                            {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Tên thánh</label>
                            <input
                                type="text"
                                value={formData.saintName}
                                onChange={(e) => setFormData(prev => ({ ...prev, saintName: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                            <input
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">SĐT 1</label>
                            <input
                                type="tel"
                                value={formData.parentPhone1}
                                onChange={(e) => setFormData(prev => ({ ...prev, parentPhone1: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="0901234567"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">SĐT 2</label>
                            <input
                                type="tel"
                                value={formData.parentPhone2}
                                onChange={(e) => setFormData(prev => ({ ...prev, parentPhone2: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="0901234567"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Lớp *</label>
                            <select
                                value={formData.classId}
                                onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="">Chọn lớp</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                            {errors.classId && <p className="text-red-600 text-xs mt-1">{errors.classId}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="text-red-600 text-sm">{errors.submit}</div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                        >
                            <User className="w-4 h-4" />
                            {saving ? 'Đang lưu...' : student ? 'Cập nhật' : 'Thêm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;