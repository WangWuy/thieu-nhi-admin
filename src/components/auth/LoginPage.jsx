import { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { authService } from '../../services/authService';

const LoginPage = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberLogin, setRememberLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load saved credentials on component mount
    useEffect(() => {
        const savedCredentials = authService.getSavedCredentials();
        if (savedCredentials) {
            setFormData({
                username: savedCredentials.username,
                password: savedCredentials.password
            });
            setRememberLogin(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(formData, rememberLogin);
            onLogin(response.user);
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại');
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

    const handleRememberChange = (e) => {
        setRememberLogin(e.target.checked);
        
        // If unchecked, clear saved credentials
        if (!e.target.checked) {
            authService.clearSavedCredentials();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-red-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-800">Admin Panel</h1>
                    <p className="text-red-600 mt-2">Quản lý Thiếu Nhi Giáo Xứ</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-red-700 mb-2">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="Nhập tên đăng nhập"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-red-700 mb-2">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 pr-12 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                placeholder="Nhập mật khẩu"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Login Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberLogin"
                            checked={rememberLogin}
                            onChange={handleRememberChange}
                            className="w-4 h-4 text-red-600 bg-red-50 border-red-200 rounded focus:ring-red-500 focus:ring-2"
                        />
                        <label htmlFor="rememberLogin" className="ml-2 text-sm text-red-700 cursor-pointer select-none">
                            Ghi nhớ đăng nhập
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-400 disabled:to-red-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang đăng nhập...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" />
                                Đăng nhập
                            </>
                        )}
                    </button>
                </form>

                {/* Footer note */}
                {rememberLogin && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700 text-center">
                            <span className="font-medium">Lưu ý:</span> Thông tin đăng nhập sẽ được lưu trên thiết bị này. 
                            Không sử dụng tính năng này trên máy tính chung.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;