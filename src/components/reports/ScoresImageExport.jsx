import { useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

const ScoresImageExport = ({ reportData, filters, className = "" }) => {
    const [exporting, setExporting] = useState(false);

    const handleExportImage = async () => {
        try {
            setExporting(true);

            // Tạo element ẩn để render báo cáo
            const exportElement = document.createElement('div');
            exportElement.style.position = 'absolute';
            exportElement.style.left = '-9999px';
            exportElement.style.top = '-9999px';
            exportElement.style.width = '1600px';
            exportElement.style.backgroundColor = 'white';
            exportElement.style.padding = '22px';
            exportElement.style.fontFamily = 'Arial, sans-serif';

            // Render bảng điểm
            if (reportData.ranking) {
                exportElement.innerHTML = generateScoresImageHTML(reportData, filters);
            } else {
                throw new Error('Không có dữ liệu điểm số để xuất');
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
            link.download = `bang_diem_${new Date().toISOString().split('T')[0]}.png`;
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
            className={`bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${className}`}
        >
            {exporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
                <Camera className="w-4 h-4" />
            )}
            {exporting ? 'Đang xuất...' : 'Xuất ảnh bảng điểm'}
        </button>
    );
};

// Hàm tạo HTML cho bảng điểm
const generateScoresImageHTML = (reportData, filters) => {
    const students = reportData.ranking || [];
    const className = students.length > 0 ? students[0].class.name : 'Không xác định';

     // Hàm tạo title dựa trên năm học
     const getScoreTitle = () => {
        // Lấy năm học từ học sinh đầu tiên
        const academicYear = students.length > 0 && students[0].academicYear 
            ? students[0].academicYear.name 
            : (() => {
                // Nếu không có, tạo năm học hiện tại (năm nay - năm sau)
                const currentYear = new Date().getFullYear();
                return `${currentYear}-${currentYear + 1}`;
            })();
        
        return `BẢNG ĐIỂM NĂM HỌC GIÁO LÝ ${academicYear}`;
    };

    // Định nghĩa tất cả cột có thể có với nhóm
    const allColumns = [
        { key: 'thursdayScore', label: 'Đi Lễ T5', width: '80px', group: 'attendance' },
        { key: 'sundayScore', label: 'Học GL', width: '80px', group: 'attendance' },
        { key: 'attendanceAverage', label: 'Điểm TB', width: '80px', group: 'attendance' },
        { key: 'hk1_45min', label: "45' HKI", width: '80px', group: 'study' },
        { key: 'hk1_exam', label: 'Thi HKI', width: '80px', group: 'study' },
        { key: 'hk2_45min', label: "45' HKII", width: '80px', group: 'study' },
        { key: 'hk2_exam', label: 'Thi HKII', width: '80px', group: 'study' },
        { key: 'studyAverage', label: 'Điểm TB', width: '80px', group: 'study' }
    ];

    // Lọc cột theo selectedScoreColumns
    let selectedColumns;
    if (filters.selectedScoreColumns && filters.selectedScoreColumns.length > 0) {
        selectedColumns = allColumns.filter(col => filters.selectedScoreColumns.includes(col.key));
    } else {
        selectedColumns = allColumns; // Hiện tất cả nếu không chọn
    }

    // Nhóm cột theo group
    const attendanceColumns = selectedColumns.filter(col => col.group === 'attendance');
    const studyColumns = selectedColumns.filter(col => col.group === 'study');

    // Hàm xác định kết quả dựa trên điểm tổng
    const getResult = (finalScore) => {
        const score = parseFloat(finalScore) || 0;
        if (score >= 8.5) return 'Ớ Lai';
        if (score >= 6.5) return 'Ở Lại';
        return '';
    };

    return `
        <div style="width: 1600px; padding: 40px; background: white; font-family: Arial, sans-serif; color: black;">
             <!-- Header với logo và text giữa -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 0 50px;">

                <!-- Logo trái -->
                <img src="/images/logo-left.png" alt="Logo trái"
                    style="width: 140px; height: 160px; object-fit: contain;" />

                <!-- Text giữa -->
                <div style="flex: 1; text-align: center; color: black;">
                    <div style="font-size: 30px; font-weight: bold; margin-bottom: 10px; color: #1a4f67;">
                        Phong trào thiếu nhi thánh thể Việt Nam
                    </div>
                    <div style="font-size: 26px; font-weight: bold; color: #1a4f67;">
                        Giáo xứ Thiên Ân - Xứ đoàn Fatima
                    </div>
                </div>

                <!-- Logo phải -->
                <img src="/images/logo-right.png" alt="Logo phải"
                    style="width: 180px; height: 180px; object-fit: contain;" />

            </div>

            <!-- Phần tiêu đề và lớp -->
            <div style="text-align: center; margin-bottom: 22px; color: black;">
                <div style="font-size: 32px; font-weight: bold; text-decoration: underline; margin-top: 22px;">
                    ${getScoreTitle()}
                </div>
                <div style="font-size: 28px; margin-top: 15px; font-weight: bold;">
                    Lớp: ${className}
                </div>
            </div>

            <!-- Bảng điểm với header 2 hàng -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                <!-- Header hàng 1 -->
                <tr>
                    <th rowspan="2" style="border: 2px solid #000; padding: 3px 8px 20px 8px; text-align: center; font-weight: bold; font-size: 22px; width: 40px; color: black; background-color: #e8f5e8;">Stt</th>
                    <th rowspan="2" style="border: 2px solid #000; padding: 3px 28px 20px 28px; text-align: center; font-weight: bold; font-size: 22px; width: 80px; color: black; background-color: #e8f5e8;">Tên thánh</th>
                    <th colspan="2" rowspan="2" style="border: 2px solid #000; padding: 6px 8px 20px 8px; text-align: center; font-weight: bold; font-size: 22px; width: 200px; color: black; background-color: #e8f5e8;">Họ và Tên</th>
                    ${attendanceColumns.length > 0 ? `<th colspan="${attendanceColumns.length}" style="border: 2px solid #000; padding: 6px 8px 20px 8px; text-align: center; font-weight: bold; font-size: 22px; background-color: #ffe699; color: black;">Điểm Danh</th>` : ''}
                    ${studyColumns.length > 0 ? `<th colspan="${studyColumns.length}" style="border: 2px solid #000; padding: 6px 8px 20px 8px; text-align: center; font-weight: bold; font-size: 22px; background-color: #ddebf7; color: black;">Điểm Giáo Lý</th>` : ''}
                    <th rowspan="2" style="border: 2px solid #000; padding: 3px 8px 20px 8px; text-align: center; font-weight: bold; font-size: 22px; width: 80px; background-color: #fffe99; color: black;">Điểm Tổng</th>
                    <th rowspan="2" style="border: 2px solid #000; padding: 3px 8px 20px 8px; text-align: center; font-weight: bold; font-size: 22px; width: 60px; background-color: #fffe99; color: black;">Hạng</th>
                    <th rowspan="2" style="border: 2px solid #000; padding: 3px 8px 20px 8px; text-align: center; font-weight: bold; font-size: 22px; width: 80px; background-color: #fffe99; color: black;">Kết quả</th>
                </tr>
                
                <!-- Header hàng 2 -->
                <tr>
                    ${attendanceColumns.map(col => 
                        `<th style="border: 2px solid #000; padding: 3px 8px 20px 8px; text-align: center; font-weight: bold; font-size: 22px; width: ${col.width}; background-color: #ffe699; color: black;">${col.label}</th>`
                    ).join('')}
                    ${studyColumns.map(col => 
                        `<th style="border: 2px solid #000; padding: 3px 8px 20px 8px; text-align: center; font-weight: bold; font-size: 22px; width: ${col.width}; background-color: #ddebf7; color: black;">${col.label}</th>`
                    ).join('')}
                </tr>
                
                <!-- Data rows -->
                <tbody>
                    ${students.map((student, index) => {
                        const fullName = student.fullName || '';
                        const nameParts = fullName.trim().split(' ');
                        const firstName = nameParts[nameParts.length - 1] || '';
                        const lastAndMiddleName = nameParts.slice(0, -1).join(' ') || '';
                        const result = getResult(student.finalAverage);
                        
                        return `
                            <tr>
                                <td style="border: 2px solid #000; padding: 3px 12px 20px 12px; text-align: center; font-size: 22px; color: black;">${index + 1}</td>
                                <td style="border: 2px solid #000; padding: 3px 28px 20px 28px; text-align: center; font-size: 22px; color: black;">${student.saintName || ''}</td>
                                <td style="border-top: 2px solid #000; border-bottom: 2px solid #000; border-left: 2px solid #000; border-right: none; padding: 6px 8px 20px 12px; text-align: left; font-size: 22px; color: black;">${lastAndMiddleName}</td>
                                <td style="border-top: 2px solid #000; border-bottom: 2px solid #000; border-left: none; border-right: 2px solid #000; padding: 6px 8px 20px 8px; text-align: center; font-size: 22px; color: black;">${firstName}</td>
                                ${attendanceColumns.map(col => {
                                    const value = student[col.key] || '0.0';
                                    return `<td style="border: 2px solid #000; padding: 3px 8px 20px 8px; text-align: center; font-size: 22px; color: black; background-color: #ffe699;">${value}</td>`;
                                }).join('')}
                                ${studyColumns.map(col => {
                                    const value = student[col.key] || '0.0';
                                    return `<td style="border: 2px solid #000; padding: 3px 8px 20px 8px; text-align: center; font-size: 22px; color: black; background-color: #ddebf7;">${value}</td>`;
                                }).join('')}
                                <td style="border: 2px solid #000; padding: 3px 8px 20px 8px; text-align: center; font-size: 22px; color: black; font-weight: bold; background-color: #fffe99;">${student.finalAverage || '0.0'}</td>
                                <td style="border: 2px solid #000; padding: 3px 8px 20px 8px; text-align: center; font-size: 22px; color: black; background-color: #fffe99;">${student.calculatedRank || ''}</td>
                                <td style="border: 2px solid #000; padding: 3px 8px 20px 8px; text-align: center; font-size: 22px; color: black; font-weight: bold; background-color: #fffe99;">${result}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <!-- Footer thông tin -->
            <div style="margin-top: 30px; font-size: 20px; color: black; text-align: center;">
                Báo cáo được tạo ngày: ${new Date().toLocaleDateString('vi-VN')} | 
                Lớp: ${className} | Năm học: 2025-2026
            </div>
        </div>
    `;
};

export default ScoresImageExport;