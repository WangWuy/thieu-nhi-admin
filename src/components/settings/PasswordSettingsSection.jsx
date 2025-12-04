import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';

const PasswordSettingsSection = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        try {
            await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            alert('Đổi mật khẩu thành công!');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="max-w-md space-y-4">
            <div>
                <label className="block text-sm font-medium text-red-700 mb-2">
                    Mật khẩu hiện tại
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
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
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-red-700 mb-2">
                    Xác nhận mật khẩu mới
                </label>
                <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
    );
};

export default PasswordSettingsSection;
