import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Calendar,
    Filter,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { departmentService } from '../../services/departmentService';

const AttendanceStatsPage = () => {
    const [stats, setStats] = useState(null);
    const [classes, setClasses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeChart, setActiveChart] = useState('overview');
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        classId: '',
        departmentId: ''
    });
    const [trendData, setTrendData] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchStats();
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const [classData, deptData] = await Promise.all([
                classService.getClasses(),
                departmentService.getDepartments()
            ]);
            setClasses(classData);
            setDepartments(deptData);
        } catch (err) {
            setError('Không thể tải dữ liệu');
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [statsData, trendDataResponse] = await Promise.all([
                attendanceService.getAttendanceStats(filters),
                attendanceService.getAttendanceTrend(filters)  // Thêm call này
            ]);
            setStats(statsData);
            setTrendData(trendDataResponse);  // Set trend data
        } catch (err) {
            setError('Không thể tải thống kê');
        } finally {
            setLoading(false);
        }
    };

    const generateTrendData = () => {
        if (!trendData || trendData.length === 0) {
            return Array.from({ length: 7 }, (_, i) => ({
                date: `${i + 1}/1`,
                'Có mặt': 0,
                'Vắng mặt': 0
            }));
        }

        return trendData.map(day => ({
            date: new Date(day.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
            'Có mặt': day.thursday.present + day.sunday.present,
            'Vắng mặt': day.thursday.absent + day.sunday.absent
        }));
    };

    const generateComparisonData = () => {
        if (!stats) {
            return [
                { type: 'Thứ 5', 'Có mặt': 0, 'Vắng mặt': 0, 'Tổng': 0 },
                { type: 'Chủ nhật', 'Có mặt': 0, 'Vắng mặt': 0, 'Tổng': 0 }
            ];
        }

        return [
            {
                type: 'Thứ 5',
                'Có mặt': stats.thursday.present,
                'Vắng mặt': stats.thursday.absent,
                'Tổng': stats.thursday.present + stats.thursday.absent
            },
            {
                type: 'Chủ nhật',
                'Có mặt': stats.sunday.present,
                'Vắng mặt': stats.sunday.absent,
                'Tổng': stats.sunday.present + stats.sunday.absent
            }
        ];
    };

    const generatePieData = () => {
        if (!stats) {
            return [
                { name: 'Có mặt', value: 0, color: '#10B981' },
                { name: 'Vắng mặt', value: 0, color: '#EF4444' }
            ];
        }

        const totalPresent = stats.thursday.present + stats.sunday.present;
        const totalAbsent = stats.thursday.absent + stats.sunday.absent;

        return [
            { name: 'Có mặt', value: totalPresent, color: '#10B981' },
            { name: 'Vắng mặt', value: totalAbsent, color: '#EF4444' }
        ];
    };

    const StatCard = ({ title, thursday, sunday, color }) => {
        const total = thursday + sunday;
        const thursdayPercent = total > 0 ? (thursday / total * 100).toFixed(1) : 0;
        const sundayPercent = total > 0 ? (sunday / total * 100).toFixed(1) : 0;

        return (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Thứ 5</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${color.thursday}`}></div>
                            <span className="font-medium text-gray-500">{thursday}</span>
                            <span className="text-sm text-gray-500">({thursdayPercent}%)</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Chủ nhật</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${color.sunday}`}></div>
                            <span className="font-medium text-gray-500">{sunday}</span>
                            <span className="text-sm text-gray-500">({sundayPercent}%)</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">Tổng</span>
                            <span className="font-bold text-lg text-gray-900">{total}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const chartTabs = [
        { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
        { id: 'trend', label: 'Xu hướng', icon: TrendingUp },
        { id: 'comparison', label: 'So sánh', icon: Activity },
        { id: 'ratio', label: 'Tỷ lệ', icon: PieChart }
    ];

    const renderChart = () => {
        if (loading) {
            return (
                <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        switch (activeChart) {
            case 'trend':
                const trendData = generateTrendData();
                return (
                    <div>
                        {!stats && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                                Chưa có dữ liệu để hiển thị xu hướng
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis dataKey="date" className="text-sm" />
                                <YAxis className="text-sm" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="Có mặt"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Vắng mặt"
                                    stroke="#EF4444"
                                    strokeWidth={3}
                                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'comparison':
                const comparisonData = generateComparisonData();
                return (
                    <div>
                        {!stats && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                                Chưa có dữ liệu để so sánh
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis dataKey="type" className="text-sm" />
                                <YAxis className="text-sm" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="Có mặt" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Vắng mặt" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'ratio':
                const pieData = generatePieData();
                const hasData = pieData.some(item => item.value > 0);
                return (
                    <div>
                        {!stats && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                                Chưa có dữ liệu để hiển thị tỷ lệ
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height={350}>
                            <RechartsPieChart>
                                <Pie
                                    dataKey="value"
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label={hasData ? ({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)` : false}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                {!hasData && (
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 text-sm">
                                        Chưa có dữ liệu
                                    </text>
                                )}
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                );

            default: // overview
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stats ? (
                            <>
                                <StatCard
                                    title="Có mặt"
                                    thursday={stats.thursday.present}
                                    sunday={stats.sunday.present}
                                    color={{
                                        thursday: 'bg-green-500',
                                        sunday: 'bg-green-400'
                                    }}
                                />
                                <StatCard
                                    title="Vắng mặt"
                                    thursday={stats.thursday.absent}
                                    sunday={stats.sunday.absent}
                                    color={{
                                        thursday: 'bg-red-500',
                                        sunday: 'bg-red-400'
                                    }}
                                />
                            </>
                        ) : (
                            <div className="col-span-2 text-center py-12">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <div className="text-gray-500">Chọn bộ lọc để xem thống kê</div>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngành</label>
                        <select
                            value={filters.departmentId}
                            onChange={(e) => setFilters(prev => ({ ...prev, departmentId: e.target.value, classId: '' }))}
                            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả ngành</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.displayName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lớp</label>
                        <select
                            value={filters.classId}
                            onChange={(e) => setFilters(prev => ({ ...prev, classId: e.target.value }))}
                            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả lớp</option>
                            {classes
                                .filter(cls => !filters.departmentId || cls.departmentId == filters.departmentId)
                                .map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Lọc dữ liệu
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Chart Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {chartTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveChart(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeChart === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-6">
                    {renderChart()}
                </div>
            </div>

            {/* Summary */}
            {stats && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Tổng kết
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.thursday.present + stats.sunday.present}
                            </div>
                            <div className="text-sm text-gray-600">Tổng có mặt</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {stats.thursday.absent + stats.sunday.absent}
                            </div>
                            <div className="text-sm text-gray-600">Tổng vắng mặt</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {stats.thursday.present + stats.thursday.absent}
                            </div>
                            <div className="text-sm text-gray-600">Tổng thứ 5</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {stats.sunday.present + stats.sunday.absent}
                            </div>
                            <div className="text-sm text-gray-600">Tổng chủ nhật</div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                            Khoảng thời gian: {new Date(filters.startDate).toLocaleDateString('vi-VN')} - {new Date(filters.endDate).toLocaleDateString('vi-VN')}
                        </div>
                        {filters.classId && (
                            <div className="text-sm text-gray-600">
                                Lớp: {classes.find(c => c.id == filters.classId)?.name}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceStatsPage;