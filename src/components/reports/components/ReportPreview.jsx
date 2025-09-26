import { Eye, FileSpreadsheet, RefreshCw } from 'lucide-react';
import AttendancePreview from './previews/AttendancePreview';
import GradeDistributionPreview from './previews/GradeDistributionPreview';
import StudentRankingPreview from './previews/StudentRankingPreview';
import OverviewPreview from './previews/OverviewPreview';

const ReportPreview = ({ reportData, filters, onExport, exportLoading }) => {
    const reportTypes = {
        'attendance': { label: 'Báo cáo điểm danh', component: AttendancePreview },
        'grade-distribution': { label: 'Phân bố điểm số', component: GradeDistributionPreview },
        'student-ranking': { label: 'Xếp hạng thiếu nhi', component: StudentRankingPreview },
        'overview': { label: 'Báo cáo tổng quan', component: OverviewPreview }
    };

    const currentReportType = reportTypes[filters.reportType];
    const PreviewComponent = currentReportType?.component;

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    Xem trước báo cáo: {currentReportType?.label}
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => onExport('xlsx')}
                        disabled={exportLoading === 'xlsx'}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                    >
                        {exportLoading === 'xlsx' ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="w-4 h-4" />
                        )}
                        Xuất Excel
                    </button>
                </div>
            </div>

            {PreviewComponent && <PreviewComponent reportData={reportData} />}
        </div>
    );
};

export default ReportPreview;