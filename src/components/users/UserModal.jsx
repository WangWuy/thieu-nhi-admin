import { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { userService } from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { USER_ROLES } from '../../utils/constants';

const UserModal = ({ user, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: '',
        saintName: '',
        fullName: '',
        birthDate: '',
        phoneNumber: '',
        address: '',
        departmentId: ''
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchDepartments();
            if (user) {
                setFormData({
                    username: user.username || '',
                    password: '',
                    role: user.role || '',
                    saintName: user.saintName || '',
                    fullName: user.fullName || '',
                    birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
                    phoneNumber: user.phoneNumber || '',
                    address: user.address || '',
                    departmentId: user.departmentId || ''
                });
            } else {
                setFormData({
                    username: '',
                    password: '',
                    role: '',
                    saintName: '',
                    fullName: '',
                    birthDate: '',
                    phoneNumber: '',
                    address: '',
                    departmentId: ''
                });
            }
            setError('');
        }
    }, [isOpen, user]);

    const fetchDepartments = async () => {
        try {
            const data = await departmentService.getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
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

            // Convert departmentId to number
            if (submitData.departmentId) {
                submitData.departmentId = parseInt(submitData.departmentId);
            }

            if (user) {
                // Edit mode - remove password if empty
                if (!submitData.password) {
                    delete submitData.password;
                }
                await userService.updateUser(user.id, submitData);
            } else {
                // Create mode
                if (!submitData.password) {
                    throw new Error('Mật khẩu là bắt buộc khi tạo mới');
                }
                await userService.createUser(submitData);
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
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
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

                        {/* Account Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên đăng nhập *
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {user ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!user}
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vai trò *
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Chọn vai trò</option>
                                <option value={USER_ROLES.BAN_DIEU_HANH}>Ban Điều Hành</option>
                                <option value={USER_ROLES.PHAN_DOAN_TRUONG}>Phân Đoàn Trưởng</option>
                                <option value={USER_ROLES.GIAO_LY_VIEN}>Giáo Lý Viên</option>
                            </select>
                        </div>

                        {/* Department (for Phan Doan Truong) */}
                        {formData.role === USER_ROLES.PHAN_DOAN_TRUONG && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngành phụ trách *
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
                        )}

                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên Thánh
                                </label>
                                <input
                                    type="text"
                                    name="saintName"
                                    value={formData.saintName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
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
                                    {user ? 'Cập nhật' : 'Tạo mới'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;