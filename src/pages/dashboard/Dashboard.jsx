import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, UserCheck, TrendingUp, AlertCircle, RefreshCw, Calendar, Award, BarChart3 } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { academicYearService } from '../../services/academicYearService';

const Dashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [currentAcademicYear, setCurrentAcademicYear] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
        fetchCurrentAcademicYear();
    }, []);

    const fetchCurrentAcademicYear = async () => {
        try {
            const yearData = await academicYearService.getCurrentAcademicYear();
            setCurrentAcademicYear(yearData);
        } catch (error) {
            console.warn('Could not fetch current academic year:', error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // Mock data for development when backend is not available
            const mockStats = {
                summary: {
                    totalDepartments: 4,
                    totalClasses: 48,
                    totalStudents: 0,
                    totalTeachers: 0
                },
                departmentStats: [
                    {
                        id: 1,
                        displayName: 'Chiên Con',
                        totalClasses: 4,
                        totalStudents: 0,
                        totalTeachers: 0,
                        averageAttendance: 0,
                        averageStudyScore: 0
                    },
                    {
                        id: 2,
                        displayName: 'Ấu Nhi',
                        totalClasses: 15,
                        totalStudents: 0,
                        totalTeachers: 0,
                        averageAttendance: 0,
                        averageStudyScore: 0
                    },
                    {
                        id: 3,
                        displayName: 'Thiếu Nhi',
                        totalClasses: 15,
                        totalStudents: 0,
                        totalTeachers: 0,
                        averageAttendance: 0,
                        averageStudyScore: 0
                    },
                    {
                        id: 4,
                        displayName: 'Nghĩa Sĩ',
                        totalClasses: 14,
                        totalStudents: 0,
                        totalTeachers: 0,
                        averageAttendance: 0,
                        averageStudyScore: 0
                    }
                ],
                recentAttendance: {
                    thursday: { present: 0, absent: 0 },
                    sunday: { present: 0, absent: 0 }
                },
                scoreOverview: {
                    totalStudentsWithScores: 0,
                    averageAttendanceScore: 0,
                    averageStudyScore: 0,
                    averageFinalScore: 0
                }
            };

            try {
                // Gọi API dashboard mới - chỉ 1 lần gọi
                const statsData = await dashboardService.getDashboardStats();
                setStats(statsData);
            } catch (apiError) {
                console.warn('API not available, using mock data:', apiError.message);
                // Use mock data when API is not available
                setStats(mockStats);
            }
        } catch (err) {
            setError('Không thể tải dữ liệu dashboard');
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        fetchDashboardData();
        fetchCurrentAcademicYear();
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                            <div className="h-4 bg-red-100 rounded w-3/4 mb-3"></div>
                            <div className="h-8 bg-red-100 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-red-800 mb-2">Lỗi tải dữ liệu</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    const StatCard = ({ icon: Icon, title, value, color, description, subValue, subLabel }) => (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-red-100 hover:shadow-md hover:border-red-200 transition-all">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-red-600">{title}</p>
                    <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
                    {description && (
                        <p className="text-xs text-red-500 mt-1">{description}</p>
                    )}
                    {subValue !== undefined && (
                        <div className="mt-2 pt-2 border-t border-red-100">
                            <p className="text-xs text-red-600">{subLabel}</p>
                            <p className="text-sm font-semibold text-red-700">{subValue}</p>
                        </div>
                    )}
                </div>
                <Icon className={`w-8 h-8 ${color.replace('text-', 'text-').replace('-600', '-500')}`} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Welcome Card with Academic Year Info */}
            <div className="bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 rounded-xl p-6 border border-red-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold mb-2 text-red-800">
                            Chào mừng, {user.saintName && `${user.saintName} `}{user.fullName}!
                        </h1>
                        <p className="text-red-700">
                            {user.role === 'ban_dieu_hanh' && 'Quản lý toàn bộ hệ thống thiếu nhi'}
                            {user.role === 'phan_doan_truong' && `Quản lý ngành ${user.department?.displayName}`}
                            {user.role === 'giao_ly_vien' && 'Quản lý lớp học và điểm danh'}
                        </p>
                    </div>
                    {currentAcademicYear && (
                        <div className="mt-4 md:mt-0 bg-white/70 rounded-lg p-3 border border-red-200">
                            <div className="flex items-center gap-2 text-red-700">
                                <Calendar className="w-4 h-4" />
                                <div>
                                    <p className="text-xs font-medium">Năm học hiện tại</p>
                                    <p className="text-sm font-bold">{currentAcademicYear.name}</p>
                                    <p className="text-xs">{currentAcademicYear.totalWeeks} tuần</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* API Status Warning */}
            {error && stats && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                        <p className="text-yellow-800 font-medium">Sử dụng dữ liệu mẫu</p>
                        <p className="text-yellow-700 text-sm">Backend chưa khởi động. Dữ liệu hiển thị chỉ mang tính minh họa.</p>
                    </div>
                </div>
            )}

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={BookOpen}
                    title="Tổng số ngành"
                    value={stats?.summary?.totalDepartments || 4}
                    color="text-blue-600"
                    description="4 ngành chính"
                />
                <StatCard
                    icon={GraduationCap}
                    title="Tổng số lớp"
                    value={stats?.summary?.totalClasses || 48}
                    color="text-green-600"
                    description="Đang hoạt động"
                />
                <StatCard
                    icon={Users}
                    title="Tổng thiếu nhi"
                    value={stats?.summary?.totalStudents || 0}
                    color="text-red-600"
                    description="Đang học"
                />
                <StatCard
                    icon={UserCheck}
                    title="Giáo lý viên"
                    value={stats?.summary?.totalTeachers || 0}
                    color="text-amber-600"
                    description="Đang phục vụ"
                />
            </div>

            {/* Score Overview - Only for admin */}
            {user.role === 'ban_dieu_hanh' && stats?.scoreOverview && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={Award}
                        title="Điểm điểm danh TB"
                        value={stats.scoreOverview.averageAttendanceScore || '0.0'}
                        color="text-blue-600"
                        description="Trung bình toàn trường"
                        subValue={`${stats.scoreOverview.totalStudentsWithScores || 0} học sinh`}
                        subLabel="Có điểm"
                    />
                    <StatCard
                        icon={BookOpen}
                        title="Điểm giáo lý TB"
                        value={stats.scoreOverview.averageStudyScore || '0.0'}
                        color="text-green-600"
                        description="Trung bình toàn trường"
                    />
                    <StatCard
                        icon={TrendingUp}
                        title="Điểm tổng TB"
                        value={stats.scoreOverview.averageFinalScore || '0.0'}
                        color="text-purple-600"
                        description="Trung bình toàn trường"
                    />
                </div>
            )}

            {/* Department Stats with Scores */}
            {user.role === 'ban_dieu_hanh' && stats?.departmentStats && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-red-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-800">
                        <BarChart3 className="w-5 h-5 text-red-600" />
                        Thống kê theo ngành
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.departmentStats.map((dept) => (
                            <div key={dept.id} className="border border-red-100 rounded-lg p-4 hover:shadow-md hover:border-red-200 transition-all">
                                <h3 className="font-medium text-red-800 mb-3">{dept.displayName}</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-red-600">Lớp:</span>
                                        <span className="font-medium text-red-800">{dept.totalClasses}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-red-600">Thiếu nhi:</span>
                                        <span className="font-medium text-red-800">{dept.totalStudents}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-red-600">Giáo lý viên:</span>
                                        <span className="font-medium text-red-800">{dept.totalTeachers}</span>
                                    </div>

                                    {/* Score Stats */}
                                    <div className="pt-2 mt-2 border-t border-red-100">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-blue-600">Điểm danh TB:</span>
                                            <span className="font-medium text-blue-700">
                                                {dept.averageAttendance ? dept.averageAttendance.toFixed(1) : '0.0'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-green-600">Học tập TB:</span>
                                            <span className="font-medium text-green-700">
                                                {dept.averageStudyScore ? dept.averageStudyScore.toFixed(1) : '0.0'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Attendance Stats */}
            {user.role === 'ban_dieu_hanh' && stats?.recentAttendance && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-red-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-800">
                        <UserCheck className="w-5 h-5 text-red-600" />
                        Điểm danh 7 ngày qua
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-red-100 rounded-lg p-4">
                            <h4 className="font-medium text-red-800 mb-2">Thứ 5</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-green-600">Có mặt:</span>
                                    <span className="font-medium text-green-600">{stats.recentAttendance.thursday.present}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Chưa điểm danh:</span>
                                    <span className="font-medium text-gray-600">{stats.recentAttendance.thursday.notMarked}</span>
                                </div>
                            </div>
                        </div>
                        <div className="border border-red-100 rounded-lg p-4">
                            <h4 className="font-medium text-red-800 mb-2">Chúa nhật</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-green-600">Có mặt:</span>
                                    <span className="font-medium text-green-600">{stats.recentAttendance.sunday.present}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Chưa điểm danh:</span>
                                    <span className="font-medium text-gray-600">{stats.recentAttendance.sunday.notMarked}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;