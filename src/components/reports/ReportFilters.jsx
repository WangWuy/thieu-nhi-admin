import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { getDefaultWeekValue, formatWeekRange, handleWeekChange } from '../../utils/weekUtils';

const ReportFilters = ({ filters, setFilters, availableFilters, onGenerate, loading }) => {
    const [weekRange, setWeekRange] = useState('');
    const [dateRangeMode, setDateRangeMode] = useState('week'); // 'week' or 'custom'

    const reportTypes = [
        { value: 'attendance', label: 'Báo cáo điểm danh' },
        { value: 'student-scores', label: 'Báo cáo điểm số' }
    ];

    const scoreColumns = [
        { value: 'thursdayScore', label: 'Đi Lễ T5' },
        { value: 'sundayScore', label: 'Học GL' },
        { value: 'attendanceAverage', label: 'Điểm TB' },
        { value: 'study45Hk1', label: '45\' HKI' },
        { value: 'examHk1', label: 'Thi HKI' },
        { value: 'study45Hk2', label: '45\' HKII' },
        { value: 'examHk2', label: 'Thi HKII' },
        { value: 'studyAverage', label: 'Điểm Tổng' }
    ];

    // Initialize default week value on component mount
    useEffect(() => {
        if (!filters.weekValue && !filters.startDate && !filters.endDate) {
            const defaultWeekValue = getDefaultWeekValue();
            handleWeekChange(defaultWeekValue, setFilters, setWeekRange);
        } else if (filters.weekValue) {
            setWeekRange(formatWeekRange(filters.weekValue));
            setDateRangeMode('week');
        } else if (filters.startDate || filters.endDate) {
            setDateRangeMode('custom');
        }
    }, []);

    // Update week range when weekValue changes
    useEffect(() => {
        if (filters.weekValue) {
            setWeekRange(formatWeekRange(filters.weekValue));
        }
    }, [filters.weekValue]);

    // Handle date range mode change
    const handleDateRangeModeChange = (mode) => {
        setDateRangeMode(mode);
        
        if (mode === 'week') {
            // Switch to week mode - clear custom dates
            setFilters(prev => ({
                ...prev,
                startDate: '',
                endDate: ''
            }));
            
            // Set default week if no week selected
            if (!filters.weekValue) {
                const defaultWeekValue = getDefaultWeekValue();
                handleWeekChange(defaultWeekValue, setFilters, setWeekRange);
            }
        } else {
            // Switch to custom mode - clear week
            setFilters(prev => ({
                ...prev,
                weekValue: '',
                weekDate: ''
            }));
            setWeekRange('');
        }
    };

    // Handle custom date change
    const handleCustomDateChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleScoreColumnChange = (columnValue) => {
        const currentColumns = filters.selectedScoreColumns || [];
        if (currentColumns.includes(columnValue)) {
            setFilters(prev => ({
                ...prev,
                selectedScoreColumns: currentColumns.filter(col => col !== columnValue)
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                selectedScoreColumns: [...currentColumns, columnValue]
            }));
        }
    };

    // Check if form is valid for submission
    const isFormValid = () => {
        if (dateRangeMode === 'week') {
            return filters.weekValue && filters.classId;
        } else {
            return filters.startDate && filters.endDate && filters.classId;
        }
    };

    return (
        <div className="space-y-4">
            {/* Date Range Mode Selection */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Chọn cách lọc thời gian:</span>
                <label className="flex items-center">
                    <input
                        type="radio"
                        name="dateRangeMode"
                        value="week"
                        checked={dateRangeMode === 'week'}
                        onChange={(e) => handleDateRangeModeChange(e.target.value)}
                        className="mr-2"
                    />
                    <span className="text-sm text-gray-900">Chọn tuần</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="radio"
                        name="dateRangeMode"
                        value="custom"
                        checked={dateRangeMode === 'custom'}
                        onChange={(e) => handleDateRangeModeChange(e.target.value)}
                        className="mr-2"
                    />
                    <span className="text-sm text-gray-900">Chọn từ ngày - đến ngày</span>
                </label>
            </div>

            {/* Date Selection and Report Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dateRangeMode === 'week' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn tuần <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="week"
                            value={filters.weekValue || ''}
                            onChange={(e) => handleWeekChange(e.target.value, setFilters, setWeekRange)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {weekRange && (
                            <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                                📅 {weekRange}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Từ ngày <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đến ngày <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại báo cáo
                    </label>
                    <select
                        value={filters.reportType}
                        onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {reportTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngành (tùy chọn)
                    </label>
                    <select
                        value={filters.departmentId}
                        onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            departmentId: e.target.value, 
                            classId: '' 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả ngành</option>
                        {availableFilters.departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.displayName}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lớp <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={filters.classId}
                        onChange={(e) => setFilters(prev => ({ ...prev, classId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Chọn lớp</option>
                        {availableFilters.classes
                            .filter(cls => !filters.departmentId || cls.departmentId == filters.departmentId)
                            .map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Năm học (tùy chọn)
                    </label>
                    <select
                        value={filters.academicYearId}
                        onChange={(e) => setFilters(prev => ({ ...prev, academicYearId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Năm học hiện tại</option>
                        {availableFilters.academicYears.map(year => (
                            <option key={year.id} value={year.id}>{year.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại điểm danh
                    </label>
                    <select
                        value={filters.attendanceType}
                        onChange={(e) => setFilters(prev => ({ ...prev, attendanceType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả</option>
                        <option value="thursday">Chỉ Thứ 5</option>
                        <option value="sunday">Chỉ Chủ nhật</option>
                    </select>
                </div>
            </div>

            {/* Score Columns Filter */}
            {filters.reportType === 'student-scores' && (
                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Chọn cột điểm số để xuất ảnh (tùy chọn - để trống sẽ xuất tất cả)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {scoreColumns.map(col => (
                            <label key={col.value} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={(filters.selectedScoreColumns || []).includes(col.value)}
                                    onChange={() => handleScoreColumnChange(col.value)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{col.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={onGenerate}
                disabled={loading || !isFormValid()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
                {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                    <BarChart3 className="w-4 h-4" />
                )}
                {loading ? 'Đang tạo báo cáo...' : 'Tạo báo cáo'}
            </button>
        </div>
    );
};

export default ReportFilters;