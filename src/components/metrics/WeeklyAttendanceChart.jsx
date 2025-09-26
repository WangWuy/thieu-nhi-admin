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
                <div className="flex items-center justify-between mb-4">
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
                <div className="flex items-center justify-between mb-4">
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
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        {attendanceType === 'sunday' ? 'Biểu đồ Chủ nhật' : 'Biểu đồ Thứ 5'}
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {data?.summary?.attendanceType || (attendanceType === 'sunday' ? 'Chủ nhật' : 'Thứ 5')}
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

            <div className="p-6">
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {data.chartData?.datasets?.map((dataset) => {
                            const total = dataset.data.reduce((sum, val) => sum + val, 0);
                            const avg = (total / dataset.data.length).toFixed(0);
                            const trend = dataset.data[dataset.data.length - 1] > dataset.data[0] ? 'up' : 'down';

                            return (
                                <div key={dataset.name} className="text-center">
                                    <div className="font-medium text-gray-900 flex items-center justify-center gap-1">
                                        {avg}
                                        {trend === 'up' ? (
                                            <TrendingUp className="w-3 h-3 text-green-600" />
                                        ) : (
                                            <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />
                                        )}
                                    </div>
                                    <div className="text-gray-600">{dataset.name} (TB)</div>
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