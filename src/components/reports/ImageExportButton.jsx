import { useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

const ImageExportButton = ({ reportData, filters, className = "" }) => {
    const [exporting, setExporting] = useState(false);

    const handleExportImage = async () => {
        try {
            setExporting(true);

            // Tạo element ẩn để render báo cáo
            const exportElement = document.createElement('div');
            exportElement.style.position = 'absolute';
            exportElement.style.left = '-9999px';
            exportElement.style.top = '-9999px';
            exportElement.style.width = '1200px';
            exportElement.style.backgroundColor = 'white';
            exportElement.style.padding = '20px';
            exportElement.style.fontFamily = 'Arial, sans-serif';

            // Render báo cáo attendance theo format mẫu
            if (filters.reportType === 'attendance' && reportData.attendanceData) {
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
    // Group attendance data by student and week
    const attendanceByStudentAndWeek = {};
    const allWeeks = new Map(); // Map to store week info with representative dates

    reportData.attendanceData.forEach(record => {
        const studentId = record.student.id;
        const recordDate = new Date(record.attendanceDate);

        // Calculate week start (Monday)
        const day = recordDate.getDay();
        const diff = recordDate.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(recordDate);
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);

        const weekKey = weekStart.toISOString().split('T')[0];

        // Determine column type and representative date
        let columnType, representativeDate;

        if (record.attendanceType === 'sunday') {
            // Chủ nhật: hiển thị ngày thực tế
            columnType = 'sunday';
            representativeDate = recordDate.toISOString().split('T')[0];
        } else {
            // Thứ 2-7: gom thành thứ 5
            columnType = 'thursday';
            // Tính ngày thứ 5 của tuần (Monday + 4 days)
            const thursday = new Date(weekStart);
            thursday.setDate(weekStart.getDate() + 4);
            representativeDate = thursday.toISOString().split('T')[0];
        }

        const columnKey = `${columnType}_${representativeDate}`;

        // Store week info
        allWeeks.set(columnKey, {
            type: columnType,
            date: representativeDate,
            weekStart: weekKey
        });

        // Group student attendance
        if (!attendanceByStudentAndWeek[studentId]) {
            attendanceByStudentAndWeek[studentId] = {
                student: record.student,
                attendance: {}
            };
        }

        // For weekdays, if any day in the week has attendance, mark as present
        if (record.isPresent) {
            attendanceByStudentAndWeek[studentId].attendance[columnKey] = true;
        }
    });

    // Sort dates và chỉ lấy 3 cột gần nhất
    const sortedColumns = Array.from(allWeeks.entries())
        .sort(([, a], [, b]) => new Date(a.date) - new Date(b.date))
        .slice(-3);

    const students = Object.values(attendanceByStudentAndWeek);

    // Get class name
    const className = students.length > 0 ? students[0].student.class.name : 'Không xác định';

    return `
        <div style="width: 1200px; padding: 40px; background: white; font-family: Arial, sans-serif; color: black;">
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
                    ĐIỂM DANH THAM DỰ THÁNH LỄ THỨ NĂM
                </div>
                <div style="font-size: 26px; margin-top: 15px; font-weight: bold;">
                    Lớp: ${className}
                </div>
            </div>


            <!-- Bảng điểm danh -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 2px solid #000; padding: 8px; text-align: center; vertical-align: middle; font-weight: bold; font-size: 26px; width: 50px; color: black;">STT</th>
                        <th style="border: 2px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 26px; width: 100px; color: black;">Tên thánh</th>
                        <th colspan="2" style="border: 2px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 26px; width: 280px; color: black;">Họ và tên</th>
                        ${sortedColumns.map(([columnKey, columnInfo], index) => {
        const dateObj = new Date(columnInfo.date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const bgColor = '#e8f5e8'; // Màu nền xanh nhạt cho header
        return `<th style="border: 2px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 26px; width: 70px; background-color: ${bgColor}; color: black;">${day}/${month}</th>`;
    }).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${students.map((studentData, index) => {
        const fullName = studentData.student.fullName || '';
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[nameParts.length - 1] || '';
        const lastAndMiddleName = nameParts.slice(0, -1).join(' ') || '';

        return `
                                <tr style="background-color: ${index % 2 === 0 ? '#f8fdf8' : 'white'};">
                                    <td style="border: 2px solid #000; padding: 8px; text-align: center; font-size: 26px; color: black;">${index + 1}</td>
                                    <td style="border: 2px solid #000; padding: 8px; text-align: center; font-size: 26px; color: black;">${studentData.student.saintName || ''}</td>
                                    <td style="border-top: 2px solid #000; border-bottom: 2px solid #000; border-left: 2px solid #000; border-right: none; padding: 8px; text-align: left; padding-left: 12px; font-size: 26px; color: black; width: 160px;">${lastAndMiddleName}</td>
                                    <td style="border-top: 2px solid #000; border-bottom: 2px solid #000; border-left: none; border-right: 2px solid #000; padding: 8px; text-align: center; font-size: 26px; color: black; width: 100px;">${firstName}</td>
                                    ${sortedColumns.map(([columnKey, columnInfo], colIndex) => {
            const isPresent = studentData.attendance[columnKey];
            const bgColor = isPresent ? '#ffffff' : '#e8f5e8'; // Màu nền khác nhau nếu có mặt hay không
            return `<td style="border: 2px solid #000; padding: 8px; text-align: center; font-size: 20px; font-weight: bold; background-color: ${bgColor}; color: black;">${isPresent ? 'X' : ''}</td>`;
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

export default ImageExportButton;