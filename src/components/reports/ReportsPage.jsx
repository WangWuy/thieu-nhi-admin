import { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Calendar,
    Users,
    BarChart3,
    TrendingUp,
    Filter,
    RefreshCw,
    Award,
    AlertCircle,
    Eye,
    FileSpreadsheet
} from 'lucide-react';
import { reportsService } from '../../services/reportsService';
import { classService } from '../../services/classService';
import { departmentService } from '../../services/departmentService';
import PDFExportButton from './PDFExportButton';

const ReportsPage = () => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState('');
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState(null);
    const [availableFilters, setAvailableFilters] = useState({
        classes: [],
        departments: [],
        academicYears: []
    });
    
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reportType: 'attendance',
        classId: '',
        departmentId: '',
        academicYearId: ''
    });

    const reportTypes = [
        { 
            value: 'attendance', 
            label: 'Báo cáo điểm danh', 
            icon: Users,
            description: 'Thống kê điểm danh theo thời gian và lớp học',
            color: 'blue'
        },
        { 
            value: 'grade-distribution', 
            label: 'Phân bổ điểm số', 
            icon: BarChart3,
            description: 'Phân tích điểm số và thành tích học tập',
            color: 'green'
        },
        { 
            value: 'student-ranking', 
            label: 'Xếp hạng thiếu nhi', 
            icon: Award,
            description: 'Ranking thiếu nhi theo điểm tổng kết',
            color: 'yellow'
        },
        { 
            value: 'overview', 
            label: 'Báo cáo tổng quan', 
            icon: TrendingUp,
            description: 'Tổng quan hoạt động và thống kê chung',
            color: 'purple'
        }
    ];

    useEffect(() => {
        fetchAvailableFilters();
    }, []);

    const fetchAvailableFilters = async () => {
        try {
            const filters = await reportsService.getAvailableFilters();
            setAvailableFilters(filters);
        } catch (err) {
            console.warn('Could not fetch filter options:', err);
        }
    };

    const handleGenerateReport = async () => {
        try {
            setLoading(true);
            setError('');
            setReportData(null);

            const params = {
                startDate: filters.startDate,
                endDate: filters.endDate,
                ...(filters.classId && { classId: filters.classId }),
                ...(filters.departmentId && { departmentId: filters.departmentId }),
                ...(filters.academicYearId && { academicYearId: filters.academicYearId })
            };

            let data;
            switch (filters.reportType) {
                case 'attendance':
                    data = await reportsService.getAttendanceReport(params);
                    break;
                case 'grade-distribution':
                    data = await reportsService.getGradeDistribution(params);
                    break;
                case 'student-ranking':
                    data = await reportsService.getStudentRanking({ ...params, limit: 100 });
                    break;
                case 'overview':
                    data = await reportsService.getOverviewReport(params);
                    break;
                default:
                    throw new Error('Loại báo cáo không hợp lệ');
            }

            setReportData(data);
        } catch (err) {
            setError(err.message || 'Không thể tạo báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = async (format = 'csv') => {
        try {
            setExportLoading(format);
            
            const exportFilters = {
                startDate: filters.startDate,
                endDate: filters.endDate,
                ...(filters.classId && { classId: filters.classId }),
                ...(filters.departmentId && { departmentId: filters.departmentId }),
                ...(filters.academicYearId && { academicYearId: filters.academicYearId })
            };

            await reportsService.exportReport(filters.reportType, format, exportFilters);
        } catch (err) {
            setError(err.message || 'Không thể xuất báo cáo');
        } finally {
            setExportLoading('');
        }
    };

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
            green: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100',
            yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100',
            purple: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
        };
        return colors[color] || colors.blue;
    };

    const renderReportPreview = () => {
        if (!reportData) return null;

        const currentReportType = reportTypes.find(type => type.value === filters.reportType);

        return (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-600" />
                        Xem trước báo cáo: {currentReportType?.label}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExportReport('csv')}
                            disabled={exportLoading === 'csv'}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                        >
                            {exportLoading === 'csv' ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileSpreadsheet className="w-4 h-4" />
                            )}
                            Xuất Excel
                        </button>
                        
                        <PDFExportButton
                            reportType={filters.reportType}
                            reportData={reportData}
                            filters={filters}
                            size="default"
                            variant="primary"
                            showPreview={true}
                        />
                    </div>
                </div>

                {filters.reportType === 'attendance' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {reportData.summary?.thursday?.present || 0}
                                </div>
                                <div className="text-sm text-gray-600">Có mặt thứ 5</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                    {reportData.summary?.thursday?.absent || 0}
                                </div>
                                <div className="text-sm text-gray-600">Vắng thứ 5</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {reportData.summary?.sunday?.present || 0}
                                </div>
                                <div className="text-sm text-gray-600">Có mặt CN</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {reportData.summary?.sunday?.absent || 0}
                                </div>
                                <div className="text-sm text-gray-600">Vắng CN</div>
                            </div>
                        </div>
                        
                        {reportData.attendanceData && reportData.attendanceData.length > 0 && (
                            <div className="max-h-96 overflow-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học sinh</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reportData.attendanceData.slice(0, 20).map((record, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {new Date(record.attendanceDate).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {record.attendanceType === 'thursday' ? 'Thứ 5' : 'Chủ nhật'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {record.student.fullName}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {record.student.class.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${record.isPresent 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'}`}>
                                                        {record.isPresent ? 'Có mặt' : 'Vắng mặt'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {reportData.attendanceData.length > 20 && (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                        Và {reportData.attendanceData.length - 20} bản ghi khác...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {filters.reportType === 'grade-distribution' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-800 mb-2">Điểm điểm danh</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Xuất sắc (≥8.5):</span>
                                        <span className="font-medium">{reportData.distribution?.attendance?.excellent || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Khá (7.0-8.4):</span>
                                        <span className="font-medium">{reportData.distribution?.attendance?.good || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>TB (5.5-6.9):</span>
                                        <span className="font-medium">{reportData.distribution?.attendance?.average || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Yếu (&lt;5.5):</span>
                                        <span className="font-medium">{reportData.distribution?.attendance?.weak || 0}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-green-800 mb-2">Điểm học tập</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Xuất sắc (≥8.5):</span>
                                        <span className="font-medium">{reportData.distribution?.study?.excellent || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Khá (7.0-8.4):</span>
                                        <span className="font-medium">{reportData.distribution?.study?.good || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>TB (5.5-6.9):</span>
                                        <span className="font-medium">{reportData.distribution?.study?.average || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Yếu (&lt;5.5):</span>
                                        <span className="font-medium">{reportData.distribution?.study?.weak || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="font-medium text-purple-800 mb-2">Điểm tổng kết</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Xuất sắc (≥8.5):</span>
                                        <span className="font-medium">{reportData.distribution?.final?.excellent || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Khá (7.0-8.4):</span>
                                        <span className="font-medium">{reportData.distribution?.final?.good || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>TB (5.5-6.9):</span>
                                        <span className="font-medium">{reportData.distribution?.final?.average || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Yếu (&lt;5.5):</span>
                                        <span className="font-medium">{reportData.distribution?.final?.weak || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {filters.reportType === 'student-ranking' && reportData.ranking && (
                    <div className="space-y-4">
                        <div className="text-center py-2 bg-gray-50 rounded-lg">
                            <span className="text-lg font-semibold">Top {Math.min(10, reportData.ranking.length)} thiếu nhi xuất sắc</span>
                        </div>
                        <div className="max-h-96 overflow-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạng</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã TN</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm TB</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.ranking.slice(0, 10).map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    student.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    #{student.rank}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{student.studentCode}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.fullName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{student.class.name}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-blue-600">{student.finalAverage}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {filters.reportType === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {reportData.summary?.totalStudents || 0}
                            </div>
                            <div className="text-sm text-gray-600">Tổng thiếu nhi</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {reportData.summary?.totalClasses || 0}
                            </div>
                            <div className="text-sm text-gray-600">Tổng lớp học</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {reportData.summary?.scoreAverages?.final || '0.0'}
                            </div>
                            <div className="text-sm text-gray-600">Điểm TB chung</div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Tạo và xuất báo cáo</span>
                </div>
            </div>

            {/* Report Generation */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Tạo báo cáo mới</h2>

                <div className="space-y-4">
                    {/* Date and Type Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngành (tùy chọn)
                            </label>
                            <select
                                value={filters.departmentId}
                                onChange={(e) => setFilters(prev => ({ ...prev, departmentId: e.target.value, classId: '' }))}
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
                                Lớp (tùy chọn)
                            </label>
                            <select
                                value={filters.classId}
                                onChange={(e) => setFilters(prev => ({ ...prev, classId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tất cả lớp</option>
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
                    </div>

                    <button
                        onClick={handleGenerateReport}
                        disabled={loading}
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
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                        <p className="text-red-800 font-medium">Lỗi tạo báo cáo</p>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Report Preview */}
            {renderReportPreview()}

            {/* Report Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {reportTypes.map((type) => (
                    <div 
                        key={type.value} 
                        className={`rounded-lg p-6 shadow-sm border transition-all cursor-pointer ${
                            filters.reportType === type.value 
                                ? getColorClasses(type.color)
                                : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                        }`}
                        onClick={() => setFilters(prev => ({ ...prev, reportType: type.value }))}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <type.icon className={`w-8 h-8 ${
                                filters.reportType === type.value 
                                    ? `text-${type.color}-600` 
                                    : 'text-gray-600'
                            }`} />
                            <h3 className="font-medium text-gray-900">{type.label}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            {type.description}
                        </p>
                        <div className={`text-sm font-medium ${
                            filters.reportType === type.value 
                                ? `text-${type.color}-700` 
                                : 'text-blue-600'
                        }`}>
                            {filters.reportType === type.value ? '✓ Đang chọn' : 'Chọn loại này →'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportsPage;