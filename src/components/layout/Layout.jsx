import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Menu,
    X,
    LogOut
} from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = ({ children, user, onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const getRoleName = (role) => {
        const roleNames = {
            'ban_dieu_hanh': 'Ban Điều Hành',
            'phan_doan_truong': 'Phân Đoàn Trưởng',
            'giao_ly_vien': 'Giáo Lý Viên'
        };
        return roleNames[role] || role;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex w-full overflow-hidden">
            {/* Sidebar Component */}
            <Sidebar 
                user={user} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
            />

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content - Takes remaining space */}
            <div className="flex-1 min-w-0 flex flex-col h-screen lg:ml-0">
                {/* Header - Compact version */}
                <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 relative z-30 w-full flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        
                        {/* Church Name */}
                        <div className="text-2xl font-bold text-red-800">
                            Giáo xứ Thiên Ân
                        </div>
                    </div>

                    {/* User Info & Logout */}
                    <div className="flex items-center gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user?.fullName?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-sm font-medium text-gray-900">
                                    {user?.saintName && `${user.saintName} `}{user?.fullName}
                                </div>
                                <div className="text-xs text-gray-500">{getRoleName(user?.role)}</div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Đăng xuất</span>
                        </button>
                    </div>
                </header>

                {/* Page Content - Scrollable area */}
                <main className="flex-1 overflow-auto bg-gray-50 w-full min-h-0">
                    <div className="p-4 lg:p-6 w-full max-w-none">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;