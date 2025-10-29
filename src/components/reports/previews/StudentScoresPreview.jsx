const StudentScoresPreview = ({ reportData, filters }) => {
    if (!reportData.ranking || reportData.ranking.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">Không có dữ liệu điểm số</div>
                <div className="text-gray-400 text-sm">
                    Không tìm thấy dữ liệu học sinh phù hợp với bộ lọc đã chọn
                </div>
            </div>
        );
    }

    // Lấy tối đa 50 học sinh
    const students = reportData.ranking.slice(0, 50);
    const className = students.length > 0 ? students[0].class.name : 'Không xác định';

    // Định nghĩa tất cả cột có thể có với nhóm
    const allColumns = [
        { key: 'thursdayScore', label: 'Đi Lễ T5', width: 'w-20', group: 'attendance' },
        { key: 'sundayScore', label: 'Học GL', width: 'w-20', group: 'attendance' },
        { key: 'attendanceAverage', label: 'Điểm TB', width: 'w-20', group: 'attendance' },
        { key: 'study45Hk1', label: "45' HKI", width: 'w-20', group: 'study' },
        { key: 'examHk1', label: 'Thi HKI', width: 'w-20', group: 'study' },
        { key: 'study45Hk2', label: "45' HKII", width: 'w-20', group: 'study' },
        { key: 'examHk2', label: 'Thi HKII', width: 'w-20', group: 'study' },
        { key: 'studyAverage', label: 'Điểm TB', width: 'w-20', group: 'study' }
    ];

    // Lọc cột theo selectedScoreColumns
    let selectedColumns;
    let showSummaryColumns = true; // Biến để kiểm soát hiển thị 3 cột cuối
    
    if (filters.selectedScoreColumns && filters.selectedScoreColumns.length > 0) {
        selectedColumns = allColumns.filter(col => filters.selectedScoreColumns.includes(col.key));
        showSummaryColumns = false; // Ẩn 3 cột cuối khi có chọn cột
    } else {
        selectedColumns = allColumns; // Hiển thị tất cả nếu không chọn
        showSummaryColumns = true; // Hiện 3 cột cuối
    }

    // Nhóm cột theo group
    const attendanceColumns = selectedColumns.filter(col => col.group === 'attendance');
    const studyColumns = selectedColumns.filter(col => col.group === 'study');

    return (
        <div className="space-y-4">
            {/* Tiêu đề lớp */}
            <div className="text-center py-2 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold">
                    Bảng điểm {students.length} thiếu nhi - Lớp: {className}
                </h2>
            </div>

            {/* Bảng điểm theo format như xuất ảnh */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="min-w-full border-collapse">
                    <thead>
                        {/* Header hàng 1 */}
                        <tr className="bg-gray-50">
                            <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-green-50 w-12">Stt</th>
                            <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-green-50 w-40">Tên thánh</th>
                            <th colSpan="2" rowSpan="2" className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-green-50 w-48">Họ và Tên</th>
                            
                            {/* Chỉ hiển thị nhóm Điểm Danh nếu có cột */}
                            {attendanceColumns.length > 0 && (
                                <th colSpan={attendanceColumns.length} className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ffe699]">
                                    Điểm Danh
                                </th>
                            )}
                            
                            {/* Chỉ hiển thị nhóm Điểm Giáo Lý nếu có cột */}
                            {studyColumns.length > 0 && (
                                <th colSpan={studyColumns.length} className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ddebf7]">
                                    Điểm Giáo Lý
                                </th>
                            )}
                            
                            {/* Chỉ hiện 3 cột cuối khi KHÔNG chọn cột nào */}
                            {showSummaryColumns && (
                                <>
                                    <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#fffe99] w-20">Điểm Tổng</th>
                                    <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#fffe99] w-16">Hạng</th>
                                    <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#fffe99] w-20">Kết quả</th>
                                </>
                            )}
                        </tr>
                        
                        {/* Header hàng 2 */}
                        <tr className="bg-gray-50">
                            {/* Hiển thị các cột Điểm Danh được chọn */}
                            {attendanceColumns.map(col => (
                                <th key={col.key} className={`border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ffe699] ${col.width}`}>
                                    {col.label}
                                </th>
                            ))}
                            
                            {/* Hiển thị các cột Điểm Giáo Lý được chọn */}
                            {studyColumns.map(col => (
                                <th key={col.key} className={`border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ddebf7] ${col.width}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => {
                            const fullName = student.fullName || '';
                            const nameParts = fullName.trim().split(' ');
                            const firstName = nameParts[nameParts.length - 1] || '';
                            const lastAndMiddleName = nameParts.slice(0, -1).join(' ') || '';
                            
                            return (
                                <tr key={student.id} className="bg-white">
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">{index + 1}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">{student.saintName || ''}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-left text-sm text-gray-900 border-r-0 pl-4">{lastAndMiddleName}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 border-l-0">{firstName}</td>
                                    
                                    {/* Hiển thị các cột Điểm Danh được chọn */}
                                    {attendanceColumns.map(col => {
                                        const value = student[col.key] !== undefined && student[col.key] !== null 
                                            ? student[col.key] 
                                            : '0.0';
                                        return (
                                            <td key={col.key} className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#ffe699]">
                                                {value}
                                            </td>
                                        );
                                    })}
                                    
                                    {/* Hiển thị các cột Điểm Giáo Lý được chọn */}
                                    {studyColumns.map(col => {
                                        const value = student[col.key] !== undefined && student[col.key] !== null 
                                            ? student[col.key] 
                                            : '0.0';
                                        return (
                                            <td key={col.key} className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#ddebf7]">
                                                {value}
                                            </td>
                                        );
                                    })}
                                    
                                    {/* Chỉ hiện 3 cột cuối khi KHÔNG chọn cột nào */}
                                    {showSummaryColumns && (
                                        <>
                                            <td className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-black bg-[#fffe99]">{student.finalAverage || '0.0'}</td>
                                            <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#fffe99]">{student.calculatedRank || ''}</td>
                                            <td className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-900 bg-[#fffe99]">{student.result}</td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {reportData.ranking.length > 50 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                    Hiển thị 50/{reportData.ranking.length} học sinh đầu tiên
                    <br />
                    <span className="text-xs">Xuất Excel để xem đầy đủ</span>
                </div>
            )}

            {/* Thống kê tóm tắt */}
            {reportData.statistics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {reportData.statistics.totalStudents}
                        </div>
                        <div className="text-sm text-gray-600">Tổng thiếu nhi</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {reportData.statistics.averageAttendanceScore}
                        </div>
                        <div className="text-sm text-gray-600">TB Điểm Danh</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                            {reportData.statistics.averageStudyScore}
                        </div>
                        <div className="text-sm text-gray-600">TB Giáo Lý</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            {reportData.statistics.averageFinalScore}
                        </div>
                        <div className="text-sm text-gray-600">TB Tổng kết</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentScoresPreview;