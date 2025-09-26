import { Eye } from 'lucide-react';
import AttendancePreview from './previews/AttendancePreview';
import StudentScoresPreview from './previews/StudentScoresPreview';
import ImageExportButton from './AttendanceImageExport';
import ScoresImageExport from './ScoresImageExport';
import CorrectExcelExport from './CorrectExcelExport';

const ReportPreview = ({ reportData, filters }) => {
    const reportTypes = {
        'attendance': { label: 'Báo cáo điểm danh', component: AttendancePreview },
        'student-scores': { label: 'Báo cáo điểm số', component: StudentScoresPreview }
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
                    {/* Xuất ảnh cho báo cáo điểm danh */}
                    {filters.reportType === 'attendance' && (
                        <ImageExportButton 
                            reportData={reportData}
                            filters={filters}
                        />
                    )}
                    
                    {/* Xuất ảnh cho báo cáo điểm số */}
                    {filters.reportType === 'student-scores' && (
                        <ScoresImageExport 
                            reportData={reportData}
                            filters={filters}
                        />
                    )}
                    
                    <CorrectExcelExport 
                        reportData={reportData}
                        filters={filters}
                    />
                </div>
            </div>

            {PreviewComponent && <PreviewComponent reportData={reportData} />}
        </div>
    );
};

export default ReportPreview;