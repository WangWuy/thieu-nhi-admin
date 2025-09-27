import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { getDefaultWeekValue, formatWeekRange, handleWeekChange } from '../../utils/weekUtils';

const ReportFilters = ({ filters, setFilters, availableFilters, onGenerate, loading }) => {
    const [weekRange, setWeekRange] = useState('');

    const reportTypes = [
        { value: 'attendance', label: 'Báo cáo điểm danh' },
        { value: 'student-scores', label: 'Báo cáo điểm số' }
    ];

    const scoreColumns = [
        { value: 'attendanceAverage', label: 'Đi Lễ T5' },
        { value: 'studyAverage', label: 'Học GL' },
        { value: 'midtermAverage', label: 'Điểm TB' },
        { value: 'hk1_45min', label: '45\' HKI' },
        { value: 'hk1_exam', label: 'Thi HKI' },
        { value: 'hk2_45min', label: '45\' HKII' },
        { value: 'hk2_exam', label: 'Thi HKII' },
        { value: 'finalAverage', label: 'Điểm Tổng' }
    ];

    // Initialize default week value on component mount
    useEffect(() => {
        if (!filters.weekValue && !filters.startDate && !filters.endDate) {
            const defaultWeekValue = getDefaultWeekValue();
            handleWeekChange(defaultWeekValue, setFilters, setWeekRange);
        } else if (filters.weekValue) {
            setWeekRange(formatWeekRange(filters.weekValue));
        }
    }, []);

    // Update week range when weekValue changes
    useEffect(() => {
        if (filters.weekValue) {
            setWeekRange(formatWeekRange(filters.weekValue));
        }
    }, [filters.weekValue]);

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

    return (
        <div className="space-y-4">
            {/* Week Selection and Report Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <option value="sunday">Chỉ Chúa nhật</option>
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
                disabled={loading || !filters.weekValue || !filters.classId}
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