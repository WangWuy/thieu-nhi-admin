import { useState } from 'react';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

const CorrectExcelExport = ({ reportData, filters, className = "" }) => {
    const [exporting, setExporting] = useState(false);

    // Hàm sắp xếp học sinh theo họ tên (giống backend sortStudentsByLastName)
    const sortStudentsByLastName = (students) => {
        return students.sort((a, b) => {
            const nameA = a.fullName || '';
            const nameB = b.fullName || '';
            return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
        });
    };

    // Hàm tính ngày trong tuần giống backend getWeekRange
    const getWeekRange = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
        const startDate = new Date(d.setDate(diff));
        return { startDate };
    };

    const exportAttendanceToExcel = async () => {
        if (!reportData.attendanceData || !filters.classId) {
            alert('Không có dữ liệu hoặc thiếu thông tin lớp');
            return;
        }

        // Bước 1: Lấy tất cả học sinh trong lớp từ attendance data
        const studentsMap = {};
        reportData.attendanceData.forEach(record => {
            const studentId = record.student.id;
            if (!studentsMap[studentId]) {
                studentsMap[studentId] = {
                    id: record.student.id,
                    studentCode: record.student.studentCode,
                    saintName: record.student.saintName || '',
                    fullName: record.student.fullName,
                    class: record.student.class
                };
            }
        });
        
        const allStudents = Object.values(studentsMap);
        const sortedStudents = sortStudentsByLastName(allStudents);

        // Bước 2: Group attendance data theo tuần và loại, tính ngày chính xác
        const weeklyData = {};
        reportData.attendanceData.forEach(record => {
            if (!record.isPresent) return; // Chỉ lấy có mặt

            const { startDate: weekStart } = getWeekRange(record.attendanceDate);
            const weekKey = weekStart.toISOString().split('T')[0];
            const typeKey = record.attendanceType;
            const key = `${weekKey}_${typeKey}`;

            if (!weeklyData[key]) {
                const weekStartDate = new Date(weekStart);
                let correctDate;

                if (typeKey === 'thursday') {
                    correctDate = new Date(weekStartDate);
                    correctDate.setDate(weekStartDate.getDate() + 3);
                } else if (typeKey === 'sunday') {
                    correctDate = new Date(weekStartDate);
                    correctDate.setDate(weekStartDate.getDate() + 6);
                } else {
                    correctDate = weekStartDate;
                }

                weeklyData[key] = {
                    weekStart: weekKey,
                    type: typeKey,
                    correctDate: correctDate,
                    studentIds: new Set()
                };
            }

            weeklyData[key].studentIds.add(record.studentId);
        });

        // Bước 3: Lấy unique dates và sort, chỉ lấy 3 ngày gần nhất
        const uniqueDates = Object.values(weeklyData)
            .map(item => item.correctDate.toISOString().split('T')[0])
            .sort()
            .slice(-3);

        // Bước 4: Tạo attendance map
        const attendanceMap = {};
        Object.values(weeklyData).forEach(weekData => {
            const dateKey = weekData.correctDate.toISOString().split('T')[0];
            if (uniqueDates.includes(dateKey)) {
                weekData.studentIds.forEach(studentId => {
                    attendanceMap[`${studentId}_${dateKey}`] = true;
                });
            }
        });

        // Bước 5: Tạo workbook với styling giống ảnh mẫu
        const workbook = XLSX.utils.book_new();

        // Tạo header với merge cells
        const headers = [
            'STT', 
            'Tên thánh', 
            'Họ và tên lót', 
            'Tên',
            ...uniqueDates.map(date => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                return `${day}${month}`;
            })
        ];

        // Tạo data rows
        const rows = [headers];

        sortedStudents.forEach((student, index) => {
            const fullName = student.fullName || '';
            const nameParts = fullName.trim().split(' ');
            const firstName = nameParts[nameParts.length - 1] || '';
            const lastAndMiddleName = nameParts.slice(0, -1).join(' ') || '';

            const row = [
                index + 1,
                student.saintName,
                lastAndMiddleName,
                firstName,
                ...uniqueDates.map(date => {
                    const key = `${student.id}_${date}`;
                    return attendanceMap[key] ? 'X' : '';
                })
            ];

            rows.push(row);
        });

        // Tạo worksheet từ array
        const worksheet = XLSX.utils.aoa_to_sheet(rows);

        // Set column widths
        const colWidths = [
            { wch: 5 },   // STT
            { wch: 15 },  // Tên thánh
            { wch: 20 },  // Họ và tên lót
            { wch: 12 },  // Tên
            ...uniqueDates.map(() => ({ wch: 8 })) // Các cột ngày
        ];
        worksheet['!cols'] = colWidths;

        // Styling cells - Background xanh lá cho ô trống
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = 1; R <= range.e.r; ++R) { // Bỏ qua header row
            for (let C = 4; C <= range.e.c; ++C) { // Chỉ style các cột ngày
                const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
                const cell = worksheet[cellAddress];
                
                if (!cell || !cell.v || cell.v === '') {
                    // Ô trống - background xanh lá
                    if (!cell) worksheet[cellAddress] = {};
                    worksheet[cellAddress].s = {
                        fill: {
                            fgColor: { rgb: "90EE90" } // Light green
                        },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: {
                            top: { style: "thin" },
                            bottom: { style: "thin" },
                            left: { style: "thin" },
                            right: { style: "thin" }
                        }
                    };
                } else {
                    // Ô có X - background trắng
                    worksheet[cellAddress].s = {
                        fill: {
                            fgColor: { rgb: "FFFFFF" }
                        },
                        alignment: { horizontal: "center", vertical: "center" },
                        font: { bold: true },
                        border: {
                            top: { style: "thin" },
                            bottom: { style: "thin" },
                            left: { style: "thin" },
                            right: { style: "thin" }
                        }
                    };
                }
            }
        }

        // Style header row
        for (let C = 0; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({r: 0, c: C});
            if (worksheet[cellAddress]) {
                worksheet[cellAddress].s = {
                    fill: { fgColor: { rgb: "F0F0F0" } },
                    font: { bold: true },
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        left: { style: "medium" },
                        right: { style: "medium" }
                    }
                };
            }
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Điểm danh');

        // Generate filename
        const date = new Date().toISOString().split('T')[0];
        const className = sortedStudents[0]?.class?.name || 'unknown';
        const filename = `diem_danh_${className}_${date}.xlsx`;

        // Export
        XLSX.writeFile(workbook, filename);

        return {
            success: true,
            filename,
            recordCount: sortedStudents.length
        };
    };

    // Export functions for other report types (giữ nguyên logic cũ)
    const exportOtherReportTypes = () => {
        // Implementation for other report types
        const sheets = {};
        let filename = '';

        switch (filters.reportType) {
            case 'grade-distribution':
                const distributionData = [
                    { 'Loại điểm': 'Điểm danh', 'Xuất sắc': reportData.distribution.attendance.excellent, 'Khá': reportData.distribution.attendance.good, 'Trung bình': reportData.distribution.attendance.average, 'Yếu': reportData.distribution.attendance.weak },
                    { 'Loại điểm': 'Học tập', 'Xuất sắc': reportData.distribution.study.excellent, 'Khá': reportData.distribution.study.good, 'Trung bình': reportData.distribution.study.average, 'Yếu': reportData.distribution.study.weak },
                    { 'Loại điểm': 'Tổng kết', 'Xuất sắc': reportData.distribution.final.excellent, 'Khá': reportData.distribution.final.good, 'Trung bình': reportData.distribution.final.average, 'Yếu': reportData.distribution.final.weak }
                ];
                sheets['Phân bố điểm'] = XLSX.utils.json_to_sheet(distributionData);
                filename = `phan_bo_diem_${new Date().toISOString().split('T')[0]}.xlsx`;
                break;

            case 'student-ranking':
                if (reportData.ranking && reportData.ranking.length > 0) {
                    const rankingData = reportData.ranking.map(student => ({
                        'Xếp hạng': student.rank,
                        'Mã TN': student.studentCode,
                        'Tên Thánh': student.saintName || '',
                        'Họ và tên': student.fullName,
                        'Lớp': student.class.name,
                        'Ngành': student.class.department.displayName,
                        'Điểm điểm danh': student.attendanceAverage,
                        'Điểm học tập': student.studyAverage,
                        'Điểm tổng kết': student.finalAverage
                    }));
                    sheets['Xếp hạng'] = XLSX.utils.json_to_sheet(rankingData);
                }
                filename = `xep_hang_hoc_sinh_${new Date().toISOString().split('T')[0]}.xlsx`;
                break;

            case 'overview':
                const summaryData = [
                    { 'Chỉ số': 'Tổng thiếu nhi', 'Giá trị': reportData.summary?.totalStudents || 0 },
                    { 'Chỉ số': 'Tổng lớp học', 'Giá trị': reportData.summary?.totalClasses || 0 },
                    { 'Chỉ số': 'Tổng ngành', 'Giá trị': reportData.summary?.totalDepartments || 0 }
                ];
                sheets['Tổng quan'] = XLSX.utils.json_to_sheet(summaryData);
                filename = `bao_cao_tong_quan_${new Date().toISOString().split('T')[0]}.xlsx`;
                break;
        }

        const workbook = XLSX.utils.book_new();
        Object.entries(sheets).forEach(([name, sheet]) => {
            XLSX.utils.book_append_sheet(workbook, sheet, name);
        });

        XLSX.writeFile(workbook, filename);
        return { success: true, filename };
    };

    const handleExportExcel = async () => {
        try {
            setExporting(true);
            
            let result;
            if (filters.reportType === 'attendance') {
                result = await exportAttendanceToExcel();
            } else {
                result = exportOtherReportTypes();
            }

            if (result.success) {
                console.log(`Đã xuất file: ${result.filename}`);
            }

        } catch (error) {
            console.error('Export Excel error:', error);
            alert('Không thể xuất Excel: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExportExcel}
            disabled={exporting || !reportData}
            className={`bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${className}`}
        >
            {exporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
                <FileSpreadsheet className="w-4 h-4" />
            )}
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
        </button>
    );
};

export default CorrectExcelExport;