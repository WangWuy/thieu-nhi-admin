import { useState } from 'react';
import {
    Settings,
    User,
    Lock,
    Bell,
    Database,
    Shield,
    Save,
    Eye,
    EyeOff
} from 'lucide-react';

const SettingsPage = ({ user }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        saintName: user?.saintName || '',
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [notifications, setNotifications] = useState({
        email: true,
        attendance: true,
        reports: false,
        system: true
    });

    const tabs = [
        { id: 'profile', label: 'Thông tin cá nhân', icon: User },
        { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
        { id: 'notifications', label: 'Thông báo', icon: Bell },
        { id: 'system', label: 'Hệ thống', icon: Database }
    ];

    const handleSave = () => {
        alert('Cài đặt đã được lưu!');
    };

    const handlePasswordChange = () => {
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        alert('Mật khẩu đã được thay đổi!');
        setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-red-100">
                        <div className="p-4">
                            <h3 className="font-medium text-red-800 mb-4">Danh mục</h3>
                            <nav className="space-y-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                                                ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
                                                : 'text-red-600 hover:bg-red-50'
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow-sm border border-red-100 p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 text-red-800">Thông tin cá nhân</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">
                                            Tên Thánh
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.saintName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, saintName: e.target.value }))}
                                            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">
                                            Họ và tên
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">
                                            Vai trò
                                        </label>
                                        <input
                                            type="text"
                                            value={user?.role === 'ban_dieu_hanh' ? 'Ban Điều Hành' :
                                                user?.role === 'phan_doan_truong' ? 'Phân Đoàn Trưởng' : 'Giáo Lý Viên'}
                                            disabled
                                            className="w-full px-3 py-2 border border-red-200 rounded-lg bg-red-50 text-red-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-red-700 mb-2">
                                            Địa chỉ
                                        </label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={handleSave}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 text-red-800">Đổi mật khẩu</h2>
                                <div className="max-w-md space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">
                                            Mật khẩu hiện tại
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.currentPassword}
                                                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                className="w-full px-3 py-2 pr-10 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">
                                            Mật khẩu mới
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">
                                            Xác nhận mật khẩu mới
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handlePasswordChange}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <Lock className="w-4 h-4" />
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 text-red-800">Cài đặt thông báo</h2>
                                <div className="space-y-4">
                                    {Object.entries({
                                        email: 'Thông báo qua email',
                                        attendance: 'Nhắc nhở điểm danh',
                                        reports: 'Báo cáo định kỳ',
                                        system: 'Thông báo hệ thống'
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                                            <span className="text-red-800">{label}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications[key]}
                                                    onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={handleSave}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Lưu cài đặt
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* System Tab */}
                        {activeTab === 'system' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 text-red-800">Cài đặt hệ thống</h2>
                                <div className="space-y-6">
                                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="w-5 h-5 text-red-600" />
                                            <h3 className="font-medium text-red-800">Bảo mật</h3>
                                        </div>
                                        <p className="text-red-700 text-sm">
                                            Hệ thống đang chạy ở chế độ an toàn. Tất cả dữ liệu được mã hóa.
                                        </p>
                                    </div>

                                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Database className="w-5 h-5 text-green-600" />
                                            <h3 className="font-medium text-green-800">Sao lưu dữ liệu</h3>
                                        </div>
                                        <p className="text-green-700 text-sm mb-3">
                                            Lần sao lưu cuối: Hôm nay, 02:00 AM
                                        </p>
                                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                                            Sao lưu ngay
                                        </button>
                                    </div>

                                    <div className="text-sm text-red-600">
                                        <p><strong>Phiên bản:</strong> 1.0.0</p>
                                        <p><strong>Cập nhật cuối:</strong> 15/01/2024</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;