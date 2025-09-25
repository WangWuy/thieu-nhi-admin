import React, { useState, useEffect, useMemo } from 'react';
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
import { getValidAttendanceDates, getMostRecentAttendanceDate } from '../../utils/validAttendanceDatesUtils';

const DepartmentAttendanceChart = ({ 
    department = 'AU', 
    attendanceType = 'sunday', 
    selectedDate,
    onDataChange,
    onDateChange,
    onAttendanceTypeChange,
    onDepartmentChange
}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Get valid dates for the selected attendance type
    const validDates = useMemo(() => {
        return getValidAttendanceDates(attendanceType, 12);
    }, [attendanceType]);

    // Use provided selectedDate or most recent valid date
    const currentDate = selectedDate || getMostRecentAttendanceDate(attendanceType);

    useEffect(() => {
        fetchDepartmentAttendance();
    }, [department, attendanceType, currentDate]);

    const fetchDepartmentAttendance = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await dashboardService.getDepartmentClassesAttendance({
                department,
                attendanceType: attendanceType,
                date: currentDate
            });
            
            setData(response);
            
            if (onDataChange) {
                onDataChange(response);
            }
        } catch (err) {
            console.error('Fetch department attendance error:', err);
            setError(err.message || 'Không thể tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    // Transform data for recharts
    const chartData = React.useMemo(() => {
        if (!data?.classAttendance) return [];
        
        return data.classAttendance.map(classData => ({
            className: classData.className,
            presentCount: classData.presentCount,
            totalStudents: classData.totalStudents,
            attendanceRate: ((classData.presentCount / classData.totalStudents) * 100).toFixed(1)
        }));
    }, [data]);

    const departmentNames = {
        'CHIEN': 'Chiên con',
        'AU': 'Ấu nhi', 
        'THIEU': 'Thiếu nhi',
        'NGHIA': 'Nghĩa sĩ'
    };

    const handleDateChange = (newDate) => {
        if (onDateChange) {
            onDateChange(newDate);
        }
    };

    const handleAttendanceTypeChange = (newType) => {
        if (onAttendanceTypeChange) {
            onAttendanceTypeChange(newType);
        }
    };

    const handleDepartmentChange = (newDept) => {
        if (onDepartmentChange) {
            onDepartmentChange(newDept);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Thống kê điểm danh theo lớp - {departmentNames[department]}
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
                        Thống kê điểm danh theo lớp - {departmentNames[department]}
                    </h3>
                    <button
                        onClick={fetchDepartmentAttendance}
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
                            onClick={fetchDepartmentAttendance}
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
                        Thống kê theo lớp - {departmentNames[department]}
                    </h3>
                    <div className="flex items-center gap-3">
                        {/* Department selector */}
                        <select
                            value={department}
                            onChange={(e) => handleDepartmentChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="CHIEN">Chiên con</option>
                            <option value="AU">Ấu nhi</option>
                            <option value="THIEU">Thiếu nhi</option>
                            <option value="NGHIA">Nghĩa sĩ</option>
                        </select>

                        {/* Attendance type selector */}
                        <select
                            value={attendanceType}
                            onChange={(e) => handleAttendanceTypeChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="thursday">Thứ 5</option>
                            <option value="sunday">Chủ nhật</option>
                        </select>

                        {/* Date selector - only valid dates */}
                        <select
                            value={currentDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {validDates.map(dateItem => (
                                <option key={dateItem.value} value={dateItem.value}>
                                    {dateItem.label}
                                </option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {data?.summary?.totalClasses || 0} lớp
                        </div>
                        <button
                            onClick={fetchDepartmentAttendance}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Tải lại"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                {/* Show week range info */}
                {data?.summary?.weekRange && (
                    <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">
                        Tuần: {data.summary.weekRange} 
                        {attendanceType === 'thursday' && ' (Tập hợp điểm danh T2-T6)'}
                    </div>
                )}
            </div>

            <div className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                            dataKey="className" 
                            className="text-sm"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
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
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                            <p className="font-medium text-gray-800 mb-2">{`Lớp: ${label}`}</p>
                                            <p className="text-green-600">{`Có mặt: ${data.presentCount}/${data.totalStudents} học sinh`}</p>
                                            <p className="text-blue-600">{`Tỷ lệ: ${data.attendanceRate}%`}</p>
                                            {attendanceType === 'thursday' && (
                                                <p className="text-xs text-gray-500 mt-1">Tập hợp cả tuần (T2-T6)</p>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        
                        <Bar
                            dataKey="presentCount"
                            name="Có mặt"
                            fill="#3B82F6"
                            radius={[4, 4, 0, 0]}
                        >
                            <LabelList 
                                dataKey="presentCount" 
                                position="top" 
                                style={{ fontSize: '12px', fontWeight: 'bold', fill: '#1f2937' }}
                                offset={8}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            {data && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                            <div className="font-medium text-gray-900">
                                {data.summary?.totalClasses || 0}
                            </div>
                            <div className="text-gray-600">Tổng lớp</div>
                        </div>
                        <div className="text-center">
                            <div className="font-medium text-gray-900">
                                {data.summary?.totalStudents || 0}
                            </div>
                            <div className="text-gray-600">Tổng HS</div>
                        </div>
                        <div className="text-center">
                            <div className="font-medium text-gray-900">
                                {data.summary?.totalPresent || 0}
                            </div>
                            <div className="text-gray-600">Có mặt</div>
                        </div>
                        <div className="text-center">
                            <div className="font-medium text-gray-900 flex items-center justify-center gap-1">
                                {data.summary?.averageAttendanceRate || 0}%
                                <TrendingUp className="w-3 h-3 text-green-600" />
                            </div>
                            <div className="text-gray-600">Tỷ lệ TB</div>
                        </div>
                    </div>
                    
                    <div className="text-center mt-3 text-xs text-gray-500">
                        Cập nhật: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString('vi-VN') : 'N/A'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentAttendanceChart;