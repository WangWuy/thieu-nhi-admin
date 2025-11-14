import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import WeeklyAttendanceChart from '../../components/metrics/WeeklyAttendanceChart';
import DepartmentAttendanceChart from '../../components/metrics/DepartmentAttendanceChart';
import { getMostRecentAttendanceDate } from '../../utils/validAttendanceDatesUtils';

const ComparisonToolsPage = () => {
    // State for department chart controls
    const [selectedDepartment, setSelectedDepartment] = useState('AU');
    const [selectedAttendanceType, setSelectedAttendanceType] = useState('sunday');
    const [selectedDate, setSelectedDate] = useState(() => 
        getMostRecentAttendanceDate('sunday')
    );

    const handleAttendanceTypeChange = (newType) => {
        setSelectedAttendanceType(newType);
        // Auto-select most recent valid date for the new type
        const recentDate = getMostRecentAttendanceDate(newType);
        setSelectedDate(recentDate);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h1 className="text-xl font-semibold">Thống kê điểm danh</h1>
                </div>
            </div>
            
            {/* Weekly Attendance Charts */}
            <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-800">Xu hướng 3 tuần gần nhất</h2>
                
                {/* Sunday Chart */}
                <div>
                    <WeeklyAttendanceChart 
                        attendanceType="sunday"
                        onDataChange={(data) => {
                            console.log('Sunday attendance data loaded:', data);
                        }}
                    />
                </div>

                {/* Thursday Chart */}
                <div>
                    <WeeklyAttendanceChart 
                        attendanceType="thursday"
                        onDataChange={(data) => {
                            console.log('Thursday attendance data loaded:', data);
                        }}
                    />
                </div>
            </div>

            {/* Department Classes Chart */}
            <div className="space-y-4">
                <div className="flex items-center">
                    <h2 className="text-lg font-medium text-gray-800">Thống kê theo lớp trong ngành</h2>
                </div>

                {/* Department Chart with built-in controls */}
                <div>
                    <DepartmentAttendanceChart
                        department={selectedDepartment}
                        attendanceType={selectedAttendanceType}
                        selectedDate={selectedDate}
                        onDataChange={(data) => {
                            console.log('Department attendance data loaded:', data);
                        }}
                        onDateChange={(newDate) => {
                            setSelectedDate(newDate);
                        }}
                        onAttendanceTypeChange={handleAttendanceTypeChange}
                        onDepartmentChange={(newDept) => {
                            setSelectedDepartment(newDept);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ComparisonToolsPage;
