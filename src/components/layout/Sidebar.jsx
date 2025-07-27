import { useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Users,
    GraduationCap,
    BookOpen,
    UserCheck,
    BarChart3,
    Settings
} from 'lucide-react';

const Sidebar = ({ user, sidebarOpen, setSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuGroups = [
        {
            title: 'Tổng quan',
            items: [
                { icon: Home, label: 'Dashboard', href: '/', roles: ['ban_dieu_hanh', 'phan_doan_truong', 'giao_ly_vien'] },
                { icon: BarChart3, label: 'Thống kê', href: '/stats', roles: ['ban_dieu_hanh', 'phan_doan_truong'] },
            ]
        },
        {
            title: 'Quản lý',
            items: [
                { icon: Users, label: 'Người dùng', href: '/users', roles: ['ban_dieu_hanh', 'phan_doan_truong'] },
                { icon: GraduationCap, label: 'Lớp học', href: '/classes', roles: ['ban_dieu_hanh', 'phan_doan_truong'] },
                { icon: Users, label: 'Thiếu nhi', href: '/students', roles: ['ban_dieu_hanh', 'phan_doan_truong', 'giao_ly_vien'] },
            ]
        },
        {
            title: 'Hoạt động',
            items: [
                { icon: UserCheck, label: 'Điểm danh', href: '/attendance', roles: ['ban_dieu_hanh', 'phan_doan_truong', 'giao_ly_vien'] },
                { icon: BookOpen, label: 'Báo cáo', href: '/reports', roles: ['ban_dieu_hanh', 'phan_doan_truong'] },
            ]
        },
        {
            title: 'Hệ thống',
            items: [
                { icon: Settings, label: 'Cài đặt', href: '/settings', roles: ['ban_dieu_hanh', 'phan_doan_truong', 'giao_ly_vien'] },
            ]
        }
    ];

    const filteredMenuGroups = menuGroups.map(group => ({
        ...group,
        items: group.items.filter(item => item.roles.includes(user?.role))
    })).filter(group => group.items.length > 0);

    const getRoleName = (role) => {
        const roleNames = {
            'ban_dieu_hanh': 'Ban Điều Hành',
            'phan_doan_truong': 'Phân Đoàn Trưởng',
            'giao_ly_vien': 'Giáo Lý Viên'
        };
        return roleNames[role] || role;
    };

    return (
        <div className={`w-64 bg-white shadow-xl flex-shrink-0 flex flex-col h-screen transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto border-r border-slate-200`}>
            {/* Logo - Gradient header */}
            <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-red-600 via-amber-600 to-red-700 flex-shrink-0 shadow-lg">
                <div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg p-1">
                    <img 
                        src="/images/logo.png" 
                        alt="Logo Giáo xứ Thiên Ân" 
                        className="w-full h-full object-contain rounded-lg"
                    />
                </div>
            </div>

            {/* Navigation - Scrollable area */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-red-50 to-white">
                <div className="space-y-6">
                    {filteredMenuGroups.length > 0 ? filteredMenuGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                                {group.title}
                            </h3>
                            <ul className="space-y-1">
                                {group.items.map((item) => (
                                    <li key={item.href}>
                                        <button
                                            onClick={(e) => {
                                                console.log('🔗 Menu clicked:', item.href, 'Current:', location.pathname);
                                                e.preventDefault();
                                                setSidebarOpen(false);
                                                
                                                // Add delay to ensure sidebar closes first
                                                setTimeout(() => {
                                                    console.log('📍 Navigating to:', item.href);
                                                    navigate(item.href);
                                                }, 100);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-left relative overflow-hidden ${
                                                location.pathname === item.href
                                                    ? 'bg-gradient-to-r from-red-50 to-amber-50 text-red-700 shadow-md border border-red-100'
                                                    : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-red-50 hover:text-red-600 hover:shadow-sm'
                                            }`}
                                        >
                                            {location.pathname === item.href && (
                                                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-amber-500 rounded-r-full"></div>
                                            )}
                                            <item.icon className={`w-5 h-5 transition-all duration-200 ${
                                                location.pathname === item.href 
                                                    ? 'text-red-600 scale-110' 
                                                    : 'text-slate-400 group-hover:text-red-500 group-hover:scale-105'
                                            }`} />
                                            <span className="font-medium">{item.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )) : (
                        // Fallback menu nếu có lỗi với groups
                        <div>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                                Menu
                            </h3>
                            <ul className="space-y-1">
                                {[
                                    { icon: Home, label: 'Dashboard', href: '/' },
                                    ...(user?.role !== 'giao_ly_vien' ? [
                                        { icon: BarChart3, label: 'Thống kê', href: '/stats' },
                                        { icon: Users, label: 'Người dùng', href: '/users' },
                                        { icon: GraduationCap, label: 'Lớp học', href: '/classes' },
                                    ] : []),
                                    { icon: Users, label: 'Thiếu nhi', href: '/students' },
                                    { icon: UserCheck, label: 'Điểm danh', href: '/attendance' }
                                ].map((item) => (
                                    <li key={item.href}>
                                        <button
                                            onClick={() => {
                                                console.log('🔗 Fallback menu clicked:', item.href);
                                                setSidebarOpen(false);
                                                setTimeout(() => {
                                                    console.log('📍 Fallback navigating to:', item.href);
                                                    navigate(item.href);
                                                }, 100);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-left relative overflow-hidden ${
                                                location.pathname === item.href
                                                    ? 'bg-gradient-to-r from-red-50 to-amber-50 text-red-700 shadow-md border border-red-100'
                                                    : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-red-50 hover:text-red-600 hover:shadow-sm'
                                            }`}
                                        >
                                            {location.pathname === item.href && (
                                                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-amber-500 rounded-r-full"></div>
                                            )}
                                            <item.icon className={`w-5 h-5 transition-all duration-200 ${
                                                location.pathname === item.href 
                                                    ? 'text-red-600 scale-110' 
                                                    : 'text-slate-400 group-hover:text-red-500 group-hover:scale-105'
                                            }`} />
                                            <span className="font-medium">{item.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </nav>

            {/* User Info - Modern glass card */}
            <div className="p-4 border-t border-slate-200 flex-shrink-0 bg-gradient-to-r from-red-50 to-white">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 via-amber-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-white text-sm font-semibold">
                                {user?.fullName?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-slate-800 truncate">
                                {user?.saintName && `${user.saintName} `}{user?.fullName}
                            </div>
                            <div className="text-xs text-slate-600 truncate font-medium">{getRoleName(user?.role)}</div>
                            {user?.department && (
                                <div className="text-xs text-red-600 truncate font-medium bg-red-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                    {user.department.displayName}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;