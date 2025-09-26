import { useState, useEffect } from 'react';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { reportsService } from '../../services/reportsService';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportPreview from '../../components/reports/ReportPreview';
import ErrorAlert from '../../components/reports/ErrorAlert';

const ReportsPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState(null);
    const [availableFilters, setAvailableFilters] = useState({
        classes: [],
        departments: [],
        academicYears: []
    });

    const [filters, setFilters] = useState({
        startDate: (() => {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(today);
            monday.setDate(today.getDate() + mondayOffset);
            return monday.toISOString().split('T')[0];
        })(),
        endDate: (() => {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const sundayOffset = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
            const sunday = new Date(today);
            sunday.setDate(today.getDate() + sundayOffset);
            return sunday.toISOString().split('T')[0];
        })(),
        reportType: 'attendance',
        classId: '',
        departmentId: '',
        academicYearId: '',
        attendanceType: 'all',
        selectedScoreColumns: [] // Cho báo cáo điểm số
    });

    useEffect(() => {
        fetchAvailableFilters();
    }, []);

    const fetchAvailableFilters = async () => {
        try {
            const filterData = await reportsService.getAvailableFilters();
            setAvailableFilters(filterData);
        } catch (err) {
            console.warn('Could not fetch filter options:', err);
        }
    };

    const handleGenerateReport = async () => {
        if (!filters.classId) {
            setError('Vui lòng chọn lớp để tạo báo cáo');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setReportData(null);

            const params = {
                startDate: filters.startDate,
                endDate: filters.endDate,
                ...(filters.classId && { classId: filters.classId }),
                ...(filters.departmentId && { departmentId: filters.departmentId }),
                ...(filters.academicYearId && { academicYearId: filters.academicYearId }),
                ...(filters.attendanceType !== 'all' && { attendanceType: filters.attendanceType })
            };

            let data;
            switch (filters.reportType) {
                case 'attendance':
                    data = await reportsService.getAttendanceReport(params);
                    break;
                case 'student-scores':
                    data = await reportsService.getStudentScores({ ...params, limit: 100 });
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
                
                <ReportFilters
                    filters={filters}
                    setFilters={setFilters}
                    availableFilters={availableFilters}
                    onGenerate={handleGenerateReport}
                    loading={loading}
                />
            </div>

            {/* Error Display */}
            {error && <ErrorAlert error={error} />}

            {/* Report Preview */}
            {reportData && (
                <ReportPreview
                    reportData={reportData}
                    filters={filters}
                />
            )}
        </div>
    );
};

export default ReportsPage;