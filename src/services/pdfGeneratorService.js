// pdfGeneratorService.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

class PDFGeneratorService {
    constructor() {
        this.defaultOptions = {
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        };
        this.colors = {
            primary: [220, 38, 127], // Pink
            secondary: [59, 130, 246], // Blue
            success: [16, 185, 129], // Green
            warning: [245, 158, 11], // Yellow
            danger: [239, 68, 68], // Red
            gray: [107, 114, 128]
        };
    }

    // Initialize PDF with header and footer
    initializePDF(title, orientation = 'portrait') {
        const pdf = new jsPDF({
            ...this.defaultOptions,
            orientation
        });

        this.addHeader(pdf, title);
        this.addFooter(pdf);
        
        return pdf;
    }

    // Add header with logo and title
    addHeader(pdf, title) {
        // Header background
        pdf.setFillColor(...this.colors.primary);
        pdf.rect(0, 0, pdf.internal.pageSize.width, 25, 'F');

        // Logo placeholder (you can add actual logo here)
        pdf.setFillColor(255, 255, 255);
        pdf.circle(20, 12.5, 8, 'F');
        pdf.setTextColor(220, 38, 127);
        pdf.setFontSize(10);
        pdf.text('LOGO', 16, 13);

        // Title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 40, 16);

        // Church name
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Giáo xứ Thiên Ân - Hệ thống quản lý Thiếu Nhi', 40, 21);

        // Reset text color
        pdf.setTextColor(0, 0, 0);
    }

    // Add footer with page numbers and generation info
    addFooter(pdf) {
        const pageCount = pdf.internal.getNumberOfPages();
        const pageHeight = pdf.internal.pageSize.height;
        
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            
            // Footer line
            pdf.setDrawColor(...this.colors.gray);
            pdf.line(20, pageHeight - 20, pdf.internal.pageSize.width - 20, pageHeight - 20);
            
            // Generation info
            pdf.setFontSize(8);
            pdf.setTextColor(...this.colors.gray);
            pdf.text(`Tạo lúc: ${new Date().toLocaleString('vi-VN')}`, 20, pageHeight - 15);
            
            // Page number
            pdf.text(`Trang ${i}/${pageCount}`, pdf.internal.pageSize.width - 40, pageHeight - 15);
        }
    }

    // Generate Attendance Report PDF
    async generateAttendanceReport(data, filters) {
        const pdf = this.initializePDF('BÁO CÁO ĐIỂM DANH');
        let yPosition = 35;

        // Report info
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('THÔNG TIN BÁO CÁO', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Từ ngày: ${new Date(filters.startDate).toLocaleDateString('vi-VN')}`, 20, yPosition);
        pdf.text(`Đến ngày: ${new Date(filters.endDate).toLocaleDateString('vi-VN')}`, 120, yPosition);
        yPosition += 8;

        if (filters.classId) {
            pdf.text(`Lớp: ${filters.className || 'N/A'}`, 20, yPosition);
            yPosition += 8;
        }
        if (filters.departmentId) {
            pdf.text(`Ngành: ${filters.departmentName || 'N/A'}`, 20, yPosition);
            yPosition += 8;
        }

        yPosition += 10;

        // Summary statistics
        if (data.summary) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('TỔNG KẾT', 20, yPosition);
            yPosition += 10;

            const summaryData = [
                ['Loại', 'Có mặt', 'Vắng mặt', 'Tổng', 'Tỷ lệ có mặt'],
                [
                    'Thứ 5',
                    data.summary.thursday.present.toString(),
                    data.summary.thursday.absent.toString(),
                    (data.summary.thursday.present + data.summary.thursday.absent).toString(),
                    `${((data.summary.thursday.present / (data.summary.thursday.present + data.summary.thursday.absent)) * 100).toFixed(1)}%`
                ],
                [
                    'Chủ nhật',
                    data.summary.sunday.present.toString(),
                    data.summary.sunday.absent.toString(),
                    (data.summary.sunday.present + data.summary.sunday.absent).toString(),
                    `${((data.summary.sunday.present / (data.summary.sunday.present + data.summary.sunday.absent)) * 100).toFixed(1)}%`
                ]
            ];

            pdf.autoTable({
                startY: yPosition,
                head: [summaryData[0]],
                body: summaryData.slice(1),
                theme: 'grid',
                headStyles: {
                    fillColor: this.colors.primary,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { halign: 'left' },
                    1: { halign: 'center' },
                    2: { halign: 'center' },
                    3: { halign: 'center' },
                    4: { halign: 'center' }
                }
            });

            yPosition = pdf.lastAutoTable.finalY + 15;
        }

        // Detailed attendance data
        if (data.attendanceData && data.attendanceData.length > 0) {
            // Check if need new page
            if (yPosition > 200) {
                pdf.addPage();
                yPosition = 30;
            }

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CHI TIẾT ĐIỂM DANH', 20, yPosition);
            yPosition += 10;

            const attendanceTableData = data.attendanceData.slice(0, 50).map(record => [
                new Date(record.attendanceDate).toLocaleDateString('vi-VN'),
                record.attendanceType === 'thursday' ? 'Thứ 5' : 'Chủ nhật',
                record.student.fullName,
                record.student.class.name,
                record.isPresent ? 'Có mặt' : 'Vắng mặt',
                record.note || ''
            ]);

            pdf.autoTable({
                startY: yPosition,
                head: [['Ngày', 'Loại', 'Học sinh', 'Lớp', 'Trạng thái', 'Ghi chú']],
                body: attendanceTableData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.colors.secondary,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 25, halign: 'center' },
                    5: { cellWidth: 35 }
                },
                didParseCell: (data) => {
                    if (data.column.index === 4) {
                        if (data.cell.text[0] === 'Có mặt') {
                            data.cell.styles.textColor = this.colors.success;
                            data.cell.styles.fontStyle = 'bold';
                        } else if (data.cell.text[0] === 'Vắng mặt') {
                            data.cell.styles.textColor = this.colors.danger;
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });

            if (data.attendanceData.length > 50) {
                yPosition = pdf.lastAutoTable.finalY + 10;
                pdf.setFontSize(10);
                pdf.setTextColor(...this.colors.gray);
                pdf.text(`Hiển thị 50/${data.attendanceData.length} bản ghi. Xuất file Excel để xem đầy đủ.`, 20, yPosition);
            }
        }

        this.addFooter(pdf);
        return pdf;
    }

    // Generate Grade Distribution Report PDF
    async generateGradeDistributionReport(data, filters) {
        const pdf = this.initializePDF('BÁO CÁO PHÂN BỔ ĐIỂM SỐ');
        let yPosition = 35;

        // Report info
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('THÔNG TIN BÁO CÁO', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        if (filters.academicYearId) {
            pdf.text(`Năm học: ${filters.academicYearName || 'N/A'}`, 20, yPosition);
            yPosition += 8;
        }
        pdf.text(`Tổng số học sinh: ${data.totalStudents || 0}`, 20, yPosition);
        yPosition += 15;

        // Grade distribution tables
        if (data.distribution) {
            const categories = [
                { key: 'attendance', title: 'PHÂN BỐ ĐIỂM ĐIỂM DANH', color: this.colors.primary },
                { key: 'study', title: 'PHÂN BỐ ĐIỂM HỌC TẬP', color: this.colors.secondary },
                { key: 'final', title: 'PHÂN BỐ ĐIỂM TỔNG KẾT', color: this.colors.success }
            ];

            categories.forEach((category, index) => {
                if (yPosition > 220) {
                    pdf.addPage();
                    yPosition = 30;
                }

                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text(category.title, 20, yPosition);
                yPosition += 10;

                const distData = data.distribution[category.key];
                if (distData) {
                    const total = distData.excellent + distData.good + distData.average + distData.weak;
                    const distributionTableData = [
                        [
                            'Xuất sắc (≥8.5)',
                            distData.excellent.toString(),
                            total > 0 ? `${((distData.excellent / total) * 100).toFixed(1)}%` : '0%'
                        ],
                        [
                            'Khá (7.0-8.4)',
                            distData.good.toString(),
                            total > 0 ? `${((distData.good / total) * 100).toFixed(1)}%` : '0%'
                        ],
                        [
                            'Trung bình (5.5-6.9)',
                            distData.average.toString(),
                            total > 0 ? `${((distData.average / total) * 100).toFixed(1)}%` : '0%'
                        ],
                        [
                            'Yếu (<5.5)',
                            distData.weak.toString(),
                            total > 0 ? `${((distData.weak / total) * 100).toFixed(1)}%` : '0%'
                        ]
                    ];

                    pdf.autoTable({
                        startY: yPosition,
                        head: [['Xếp loại', 'Số lượng', 'Tỷ lệ']],
                        body: distributionTableData,
                        theme: 'grid',
                        headStyles: {
                            fillColor: category.color,
                            textColor: [255, 255, 255],
                            fontStyle: 'bold'
                        },
                        columnStyles: {
                            0: { cellWidth: 60 },
                            1: { cellWidth: 30, halign: 'center' },
                            2: { cellWidth: 30, halign: 'center' }
                        }
                    });

                    yPosition = pdf.lastAutoTable.finalY + 15;
                }
            });
        }

        // Department statistics
        if (data.departmentStats) {
            if (yPosition > 150) {
                pdf.addPage();
                yPosition = 30;
            }

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('THỐNG KÊ THEO NGÀNH', 20, yPosition);
            yPosition += 10;

            const deptTableData = Object.values(data.departmentStats).map(dept => [
                dept.name || 'N/A',
                dept.totalStudents.toString(),
                dept.averageAttendance || '0.0',
                dept.averageStudy || '0.0',
                dept.averageFinal || '0.0'
            ]);

            pdf.autoTable({
                startY: yPosition,
                head: [['Ngành', 'Tổng TN', 'TB Điểm danh', 'TB Học tập', 'TB Tổng kết']],
                body: deptTableData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.colors.warning,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 25, halign: 'center' },
                    2: { cellWidth: 30, halign: 'center' },
                    3: { cellWidth: 30, halign: 'center' },
                    4: { cellWidth: 30, halign: 'center' }
                }
            });
        }

        this.addFooter(pdf);
        return pdf;
    }

    // Generate Student Ranking Report PDF
    async generateStudentRankingReport(data, filters) {
        const pdf = this.initializePDF('BÁO CÁO XẾP HẠNG THIẾU NHI');
        let yPosition = 35;

        // Report info
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('THÔNG TIN BÁO CÁO', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Tổng số thiếu nhi: ${data.ranking?.length || 0}`, 20, yPosition);
        pdf.text(`Hiển thị top: ${Math.min(50, data.ranking?.length || 0)}`, 120, yPosition);
        yPosition += 15;

        // Statistics summary
        if (data.statistics) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('THỐNG KÊ CHUNG', 20, yPosition);
            yPosition += 10;

            const statsData = [
                ['Chỉ số', 'Giá trị'],
                ['Điểm tổng trung bình', data.statistics.averageFinalScore || '0.0'],
                ['Điểm học tập trung bình', data.statistics.averageStudyScore || '0.0'],
                ['Điểm điểm danh trung bình', data.statistics.averageAttendanceScore || '0.0']
            ];

            pdf.autoTable({
                startY: yPosition,
                head: [statsData[0]],
                body: statsData.slice(1),
                theme: 'grid',
                headStyles: {
                    fillColor: this.colors.primary,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 80 },
                    1: { cellWidth: 40, halign: 'center' }
                }
            });

            yPosition = pdf.lastAutoTable.finalY + 15;
        }

        // Top performers table
        if (data.ranking && data.ranking.length > 0) {
            if (yPosition > 180) {
                pdf.addPage();
                yPosition = 30;
            }

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('BẢNG XẾP HẠNG', 20, yPosition);
            yPosition += 10;

            const rankingTableData = data.ranking.slice(0, 50).map(student => [
                student.rank.toString(),
                student.studentCode,
                student.fullName,
                student.class.name,
                student.attendanceAverage?.toFixed(1) || '0.0',
                student.studyAverage?.toFixed(1) || '0.0',
                student.finalAverage?.toFixed(1) || '0.0'
            ]);

            pdf.autoTable({
                startY: yPosition,
                head: [['Hạng', 'Mã TN', 'Họ tên', 'Lớp', 'Điểm danh', 'Học tập', 'Tổng kết']],
                body: rankingTableData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.colors.success,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 22, halign: 'center' },
                    5: { cellWidth: 22, halign: 'center' },
                    6: { cellWidth: 22, halign: 'center' }
                },
                didParseCell: (data) => {
                    if (data.column.index === 0) {
                        const rank = parseInt(data.cell.text[0]);
                        if (rank <= 3) {
                            data.cell.styles.fillColor = [255, 215, 0]; // Gold for top 3
                            data.cell.styles.textColor = [0, 0, 0];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });
        }

        this.addFooter(pdf);
        return pdf;
    }

    // Generate Comparison Report PDF
    async generateComparisonReport(data, filters) {
        const pdf = this.initializePDF('BÁO CÁO SO SÁNH HIỆU SUẤT');
        let yPosition = 35;

        // Report info
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('THÔNG TIN BÁO CÁO', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Loại so sánh: ${data.activeComparison === 'departments' ? 'Ngành' : 'Lớp'}`, 20, yPosition);
        pdf.text(`Từ ngày: ${new Date(filters.startDate).toLocaleDateString('vi-VN')}`, 120, yPosition);
        yPosition += 8;
        pdf.text(`Số đối tượng: ${data.comparisonData?.length || 0}`, 20, yPosition);
        pdf.text(`Đến ngày: ${new Date(filters.endDate).toLocaleDateString('vi-VN')}`, 120, yPosition);
        yPosition += 15;

        // Insights summary
        if (data.insights) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ĐIỂM NỔI BẬT', 20, yPosition);
            yPosition += 10;

            const insightsData = [
                ['Chỉ số', 'Giá trị'],
                ['Hiệu suất cao nhất', data.insights.bestPerformer?.name || 'N/A'],
                ['Điểm danh tốt nhất', data.insights.bestAttendance?.name || 'N/A'],
                ['Cần cải thiện', data.insights.worstPerformer?.name || 'N/A']
            ];

            pdf.autoTable({
                startY: yPosition,
                head: [insightsData[0]],
                body: insightsData.slice(1),
                theme: 'grid',
                headStyles: {
                    fillColor: this.colors.primary,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 80 },
                    1: { cellWidth: 60 }
                }
            });

            yPosition = pdf.lastAutoTable.finalY + 15;
        }

        // Comparison table
        if (data.comparisonData && data.comparisonData.length > 0) {
            if (yPosition > 180) {
                pdf.addPage();
                yPosition = 30;
            }

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('BẢNG SO SÁNH CHI TIẾT', 20, yPosition);
            yPosition += 10;

            const comparisonTableData = data.comparisonData
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((item, index) => [
                    (index + 1).toString(),
                    item.name,
                    item.totalStudents?.toString() || '0',
                    `${item.attendanceRate?.toFixed(1) || '0.0'}%`,
                    item.studyScore?.toFixed(1) || '0.0',
                    item.overallScore?.toFixed(1) || '0.0'
                ]);

            pdf.autoTable({
                startY: yPosition,
                head: [['Hạng', data.activeComparison === 'departments' ? 'Ngành' : 'Lớp', 'Thiếu nhi', 'Tỷ lệ điểm danh', 'Điểm học tập', 'Điểm tổng']],
                body: comparisonTableData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.colors.secondary,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 20, halign: 'center' },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 25, halign: 'center' },
                    3: { cellWidth: 30, halign: 'center' },
                    4: { cellWidth: 30, halign: 'center' },
                    5: { cellWidth: 25, halign: 'center' }
                },
                didParseCell: (data) => {
                    if (data.column.index === 0) {
                        const rank = parseInt(data.cell.text[0]);
                        if (rank <= 3) {
                            data.cell.styles.fillColor = [255, 215, 0]; // Gold for top 3
                            data.cell.styles.textColor = [0, 0, 0];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });
        }

        this.addFooter(pdf);
        return pdf;
    }
    async generateOverviewReport(data, filters) {
        const pdf = this.initializePDF('BÁO CÁO TỔNG QUAN');
        let yPosition = 35;

        // Report info
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TỔNG QUAN HỆ THỐNG', 20, yPosition);
        yPosition += 10;

        // Summary statistics
        if (data.summary) {
            const summaryData = [
                ['Chỉ số', 'Giá trị'],
                ['Tổng số thiếu nhi', data.summary.totalStudents?.toString() || '0'],
                ['Tổng số lớp', data.summary.totalClasses?.toString() || '0'],
                ['Tổng số ngành', data.summary.totalDepartments?.toString() || '0'],
                ['Điểm tổng trung bình', data.summary.scoreAverages?.final || '0.0']
            ];

            pdf.autoTable({
                startY: yPosition,
                head: [summaryData[0]],
                body: summaryData.slice(1),
                theme: 'grid',
                headStyles: {
                    fillColor: this.colors.primary,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 80 },
                    1: { cellWidth: 40, halign: 'center' }
                }
            });

            yPosition = pdf.lastAutoTable.finalY + 15;
        }

        // Recent attendance
        if (data.recentAttendance) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ĐIỂM DANH GẦN ĐÂY', 20, yPosition);
            yPosition += 10;

            const attendanceData = [
                ['Loại', 'Có mặt', 'Vắng mặt', 'Tỷ lệ có mặt'],
                [
                    'Thứ 5',
                    data.recentAttendance.thursday.present?.toString() || '0',
                    data.recentAttendance.thursday.absent?.toString() || '0',
                    data.recentAttendance.thursday.present > 0 ? 
                        `${((data.recentAttendance.thursday.present / (data.recentAttendance.thursday.present + data.recentAttendance.thursday.absent)) * 100).toFixed(1)}%` : '0%'
                ],
                [
                    'Chủ nhật',
                    data.recentAttendance.sunday.present?.toString() || '0',
                    data.recentAttendance.sunday.absent?.toString() || '0',
                    data.recentAttendance.sunday.present > 0 ? 
                        `${((data.recentAttendance.sunday.present / (data.recentAttendance.sunday.present + data.recentAttendance.sunday.absent)) * 100).toFixed(1)}%` : '0%'
                ]
            ];

            pdf.autoTable({
                startY: yPosition,
                head: [attendanceData[0]],
                body: attendanceData.slice(1),
                theme: 'striped',
                headStyles: {
                    fillColor: this.colors.secondary,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 30, halign: 'center' },
                    2: { cellWidth: 30, halign: 'center' },
                    3: { cellWidth: 40, halign: 'center' }
                }
            });
        }

        this.addFooter(pdf);
        return pdf;
    }

    // Save PDF file
    savePDF(pdf, filename) {
        pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    // Preview PDF in new window
    previewPDF(pdf) {
        const pdfBlob = pdf.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
    }
}

export default new PDFGeneratorService();