import { useState } from 'react';
import { FileText, Download, Eye, RefreshCw } from 'lucide-react';
import pdfGeneratorService from '../../services/pdfGeneratorService';

const PDFExportButton = ({ 
    reportType, 
    reportData, 
    filters = {}, 
    className = '',
    size = 'default',
    variant = 'primary',
    showPreview = true 
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const buttonSizes = {
        small: 'px-3 py-1 text-sm',
        default: 'px-4 py-2',
        large: 'px-6 py-3 text-lg'
    };

    const buttonVariants = {
        primary: 'bg-red-600 hover:bg-red-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        outline: 'border border-red-600 text-red-600 hover:bg-red-50'
    };

    const getReportTitle = (type) => {
        const titles = {
            attendance: 'Báo cáo điểm danh',
            'grade-distribution': 'Báo cáo phân bổ điểm số',
            'student-ranking': 'Báo cáo xếp hạng thiếu nhi',
            comparison: 'Báo cáo so sánh hiệu suất',
            overview: 'Báo cáo tổng quan'
        };
        return titles[type] || 'Báo cáo';
    };

    const generatePDF = async (action = 'download') => {
        try {
            setIsGenerating(true);
            setError('');

            if (!reportData) {
                throw new Error('Không có dữ liệu để tạo báo cáo');
            }

            let pdf;

            // Generate PDF based on report type
            switch (reportType) {
                case 'attendance':
                    pdf = await pdfGeneratorService.generateAttendanceReport(reportData, filters);
                    break;
                case 'grade-distribution':
                    pdf = await pdfGeneratorService.generateGradeDistributionReport(reportData, filters);
                    break;
                case 'student-ranking':
                    pdf = await pdfGeneratorService.generateStudentRankingReport(reportData, filters);
                    break;
                case 'comparison':
                    pdf = await pdfGeneratorService.generateComparisonReport(reportData, filters);
                    break;
                case 'overview':
                    pdf = await pdfGeneratorService.generateOverviewReport(reportData, filters);
                    break;
                default:
                    throw new Error('Loại báo cáo không được hỗ trợ');
            }

            // Action: download or preview
            if (action === 'preview') {
                pdfGeneratorService.previewPDF(pdf);
            } else {
                const filename = `${reportType.replace('-', '_')}_report`;
                pdfGeneratorService.savePDF(pdf, filename);
            }

        } catch (err) {
            setError(err.message || 'Không thể tạo báo cáo PDF');
            console.error('PDF generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => generatePDF('download');
    const handlePreview = () => generatePDF('preview');

    // Single button mode
    if (!showPreview) {
        return (
            <div className="space-y-2">
                <button
                    onClick={handleDownload}
                    disabled={isGenerating || !reportData}
                    className={`
                        ${buttonSizes[size]} 
                        ${buttonVariants[variant]} 
                        ${className}
                        rounded-lg flex items-center gap-2 font-medium transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:shadow-md
                    `}
                >
                    {isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <FileText className="w-4 h-4" />
                    )}
                    {isGenerating ? 'Đang tạo PDF...' : 'Xuất PDF'}
                </button>
                
                {error && (
                    <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded border border-red-200">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // Button group mode (download + preview)
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <button
                    onClick={handleDownload}
                    disabled={isGenerating || !reportData}
                    className={`
                        ${buttonSizes[size]} 
                        ${buttonVariants[variant]} 
                        ${className}
                        rounded-lg flex items-center gap-2 font-medium transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:shadow-md
                    `}
                >
                    {isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {isGenerating ? 'Đang tạo...' : 'Tải PDF'}
                </button>

                <button
                    onClick={handlePreview}
                    disabled={isGenerating || !reportData}
                    className={`
                        ${buttonSizes[size]} 
                        border border-gray-300 text-gray-700 hover:bg-gray-50
                        rounded-lg flex items-center gap-2 font-medium transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:shadow-md
                    `}
                >
                    <Eye className="w-4 h-4" />
                    Xem trước
                </button>
            </div>

            {error && (
                <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded border border-red-200">
                    {error}
                </div>
            )}

            {!reportData && (
                <div className="text-gray-500 text-sm bg-gray-50 px-3 py-2 rounded border border-gray-200">
                    Tạo báo cáo trước để xuất PDF
                </div>
            )}

            {reportData && !isGenerating && (
                <div className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded border border-green-200">
                    ✓ Sẵn sàng xuất: {getReportTitle(reportType)}
                </div>
            )}
        </div>
    );
};

export default PDFExportButton;