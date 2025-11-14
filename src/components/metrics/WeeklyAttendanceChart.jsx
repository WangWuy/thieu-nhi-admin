import React, { useState, useEffect } from 'react';
import { RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';

const WeeklyAttendanceChart = ({ attendanceType = 'sunday', onDataChange }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const headerLayoutClasses = 'flex flex-col gap-3 md:flex-row md:items-center md:justify-between';

    useEffect(() => {
        fetchWeeklyTrend();
    }, [attendanceType]);

    const fetchWeeklyTrend = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await dashboardService.getWeeklyAttendanceTrend(attendanceType);
            setData(response);

            if (onDataChange) {
                onDataChange(response);
            }
        } catch (err) {
            console.error('Fetch weekly trend error:', err);
            setError(err.message || 'Không thể tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    // Transform data for recharts
    const chartData = React.useMemo(() => {
        if (!data?.chartData) return [];

        return data.chartData.weeks.map((week, index) => {
            const weekData = { week };
            data.chartData.datasets.forEach(dataset => {
                weekData[dataset.name] = dataset.data[index] || 0;
            });
            return weekData;
        });
    }, [data]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className={`${headerLayoutClasses} mb-4`}>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Thống kê điểm danh 3 tuần gần nhất
                    </h3>
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                </div>
                <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className={`${headerLayoutClasses} mb-4`}>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Thống kê điểm danh 3 tuần gần nhất
                    </h3>
                    <button
                        onClick={fetchWeeklyTrend}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Tải lại"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
                <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 mb-2">Lỗi tải dữ liệu</div>
                        <p className="text-gray-600 text-sm">{error}</p>
                        <button
                            onClick={fetchWeeklyTrend}
                            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-4">
                <div className={headerLayoutClasses}>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        {attendanceType === 'sunday' ? 'Biểu đồ Chúa nhật' : 'Biểu đồ Thứ 5'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {data?.summary?.attendanceType || (attendanceType === 'sunday' ? 'Chúa nhật' : 'Thứ 5')}
                        </div>
                        <button
                            onClick={fetchWeeklyTrend}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Tải lại"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey="week"
                            className="text-sm"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            className="text-sm"
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value, name) => [
                                `${value} thiếu nhi`,
                                name
                            ]}
                            labelFormatter={(label) => `Tuần: ${label}`}
                        />
                        <Legend />

                        {data?.chartData?.datasets?.map((dataset) => (
                            <Bar
                                key={dataset.name}
                                dataKey={dataset.name}
                                name={dataset.name}
                                fill={dataset.color}
                            >
                                <LabelList
                                    dataKey={dataset.name}
                                    position="top"
                                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            {data && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {/* Tổng học sinh tuần này */}
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Tổng học sinh tuần này:</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            {data.totalTrend?.map((item, index) => (
                                <div key={index} className="text-center">
                                    <div className="font-bold text-gray-700 text-lg">
                                        {item.total}
                                    </div>
                                    <div className="text-gray-600 text-xs">
                                        {item.week}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Thống kê từng lớp */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {data.chartData?.datasets?.map((dataset) => {
                            // Tính toán dữ liệu
                            const firstWeek = dataset.data[0] || 0;
                            const lastWeek = dataset.data[dataset.data.length - 1] || 0;
                            const totalStudents = dataset.data.reduce((sum, val) => sum + val, 0);
                            const avgStudents = Math.round(totalStudents / dataset.data.length);
                            const change = lastWeek - firstWeek;
                            const isIncreasing = change > 0;
                            const isDecreasing = change < 0;

                            return (
                                <div key={dataset.name} className="text-center">
                                    {/* Hiển thị số trung bình và xu hướng */}
                                    <div className="font-medium text-gray-900 flex items-center justify-center gap-1">
                                        <span>{avgStudents}</span>
                                        {isIncreasing && (
                                            <TrendingUp className="w-3 h-3 text-green-600" />
                                        )}
                                        {isDecreasing && (
                                            <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />
                                        )}
                                    </div>

                                    {/* Tên lớp/dataset */}
                                    <div className="text-gray-600">{dataset.name}</div>

                                    {/* Hiển thị số thay đổi */}
                                    <div className="text-xs mt-1">
                                        {change !== 0 && (
                                            <span className={isIncreasing ? 'text-green-600' : 'text-red-600'}>
                                                {isIncreasing ? '+' : ''}{change} HS
                                            </span>
                                        )}
                                        {change === 0 && (
                                            <span className="text-gray-500">Không đổi</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-3 text-xs text-gray-500">
                        Cập nhật: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString('vi-VN') : 'N/A'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyAttendanceChart;
