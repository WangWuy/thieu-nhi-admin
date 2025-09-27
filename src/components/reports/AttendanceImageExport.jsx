import { useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import {
    groupAttendanceByStudentAndWeek,
    mergeAndSortStudents,
    getSortedColumns,
    parseStudentName
} from '../../utils/attendancePreviewUtils';

const AttendanceImageExport = ({ reportData, filters, className = "" }) => {
    const [exporting, setExporting] = useState(false);

    const handleExportImage = async () => {
        try {
            setExporting(true);

            // Tạo element ẩn để render báo cáo
            const exportElement = document.createElement('div');
            exportElement.style.position = 'absolute';
            exportElement.style.left = '-9999px';
            exportElement.style.top = '-9999px';
            exportElement.style.width = '1300px';
            exportElement.style.backgroundColor = 'white';
            exportElement.style.padding = '20px';
            exportElement.style.fontFamily = 'Arial, sans-serif';

            // Render báo cáo attendance theo format mẫu
            if (filters.reportType === 'attendance') {
                exportElement.innerHTML = generateAttendanceImageHTML(reportData, filters);
            } else {
                throw new Error('Chỉ hỗ trợ xuất ảnh cho báo cáo điểm danh');
            }

            document.body.appendChild(exportElement);

            // Chuyển thành canvas và tải về
            const canvas = await html2canvas(exportElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: 'white'
            });

            // Tạo link download
            const link = document.createElement('a');
            link.download = `diem_danh_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL();
            link.click();

            // Cleanup
            document.body.removeChild(exportElement);

        } catch (error) {
            console.error('Export image error:', error);
            alert('Không thể xuất ảnh: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExportImage}
            disabled={exporting || !reportData}
            className={`bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${className}`}
        >
            {exporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
                <Camera className="w-4 h-4" />
            )}
            {exporting ? 'Đang xuất...' : 'Xuất ảnh'}
        </button>
    );
};

// Hàm tạo HTML cho báo cáo điểm danh
const generateAttendanceImageHTML = (reportData, filters) => {
    // Use utils to process attendance data
    const attendanceData = reportData.attendanceData || [];
    const { attendanceByStudentAndWeek, allWeeks } = groupAttendanceByStudentAndWeek(attendanceData);
    
    // Merge and sort students
    const sortedStudents = mergeAndSortStudents(
        attendanceByStudentAndWeek, 
        reportData.studentsWithoutAttendanceList
    );

    // Get sorted columns or default columns if no data
    const sortedColumns = getSortedColumns(allWeeks, reportData.filters);

    // Hàm tạo title dựa trên reportType và năm học
    const getAttendanceTitle = (filters) => {
        if (filters.attendanceType === 'thursday') {
            return 'ĐIỂM DANH THAM DỰ THÁNH LỄ THỨ NĂM';
        } else if (filters.attendanceType === 'sunday') {
            return 'ĐIỂM DANH THAM DỰ THÁNH LỄ CHÚA NHẬT';
        }
        return 'ĐIỂM DANH THAM DỰ THÁNH LỄ THỨ NĂM VÀ CHÚA NHẬT';
    };

    // Get class name safely
    let className = 'Không xác định';
    if (sortedStudents.length > 0) {
        const firstStudent = sortedStudents[0].student;
        if (firstStudent.class?.name) {
            className = firstStudent.class.name;
        } else if (firstStudent.className) {
            className = firstStudent.className;
        }
    }

    return `
        <div style="width: 1300px; padding: 40px; background: white; font-family: Arial, sans-serif; color: black;">
            <!-- Header với logo và text giữa -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 0 30px;">

                <!-- Logo trái -->
                <img src="/images/logo-left.png" alt="Logo trái"
                    style="width: 140px; height: 160px; object-fit: contain;" />

                <!-- Text giữa -->
                <div style="flex: 1; text-align: center; color: black;">
                    <div style="font-size: 26px; font-weight: bold; margin-bottom: 10px; color: #1a4f67;">
                        Phong trào thiếu nhi thánh thể Việt Nam
                    </div>
                    <div style="font-size: 22px; font-weight: bold; color: #1a4f67;">
                        Giáo xứ Thiên Ân - Xứ đoàn Fatima
                    </div>
                </div>

                <!-- Logo phải -->
                <img src="/images/logo-right.png" alt="Logo phải"
                    style="width: 180px; height: 180px; object-fit: contain;" />

            </div>

            <!-- Phần tiêu đề và lớp -->
            <div style="text-align: center; margin-bottom: 20px; color: black;">
                <div style="font-size: 32px; font-weight: bold; text-decoration: underline; margin-top: 20px;">
                    ${getAttendanceTitle(filters)}
                </div>
                <div style="font-size: 26px; margin-top: 15px; font-weight: bold;">
                    Lớp: ${className}
                </div>
            </div>

            <!-- Bảng điểm danh -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 2px solid #000; padding: 6px 8px 24px 8px; text-align: center; font-weight: bold; font-size: 26px; width: 50px; color: black;">STT</th>
                        <th style="border: 2px solid #000; padding: 6px 8px 24px 8px; text-align: center; font-weight: bold; font-size: 26px; width: 100px; color: black;">Tên thánh</th>
                        <th colspan="2" style="border: 2px solid #000; padding: 6px 8px 24px 8px; text-align: center; font-weight: bold; font-size: 26px; width: 280px; color: black;">Họ và tên</th>
                        ${sortedColumns.map(([columnKey, columnInfo], index) => {
        const dateObj = new Date(columnInfo.date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const bgColor = '#e8f5e8';
        return `<th style="border: 2px solid #000; padding: 6px 8px 24px 8px; text-align: center; font-weight: bold; font-size: 26px; width: 70px; background-color: ${bgColor}; color: black;">${day}/${month}</th>`;
    }).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${sortedStudents.map((studentData, index) => {
        const { firstName, lastAndMiddleName } = parseStudentName(studentData.student.fullName);

        return `
                                <tr>
                                    <td style="border: 2px solid #000; padding: 6px 8px 24px 8px; text-align: center; font-size: 26px; color: black;">${index + 1}</td>
                                    <td style="border: 2px solid #000; padding: 6px 8px 24px 8px; text-align: center; font-size: 26px; color: black;">${studentData.student.saintName || ''}</td>
                                    <td style="border-top: 2px solid #000; border-bottom: 2px solid #000; border-left: 2px solid #000; border-right: none; padding: 6px 8px 24px 12px; text-align: left; font-size: 26px; color: black; width: 160px;">${lastAndMiddleName}</td>
                                    <td style="border-top: 2px solid #000; border-bottom: 2px solid #000; border-left: none; border-right: 2px solid #000; padding: 6px 8px 24px 8px; text-align: center; font-size: 26px; color: black; width: 100px;">${firstName}</td>
                                    ${sortedColumns.map(([columnKey, columnInfo], colIndex) => {
            const isPresent = studentData.attendance[columnKey];
            const bgColor = isPresent ? '#e8f5e8' : '#fff';
            return `<td style="border: 2px solid #000; padding: 6px 8px 24px 8px; text-align: center; font-size: 20px; font-weight: bold; background-color: ${bgColor}; color: black;">${isPresent ? 'X' : ''}</td>`;
        }).join('')}
                                </tr>
                            `;
    }).join('')}
                </tbody>
            </table>

                <!-- Footer thông tin -->
                <div style="margin-top: 30px; font-size: 14px; color: black; text-align: center;">
                    Báo cáo được tạo ngày: ${new Date().toLocaleDateString('vi-VN')} | 
                    Thời gian: ${filters.startDate} đến ${filters.endDate}
                </div>
            </div>
        `;
};

export default AttendanceImageExport;