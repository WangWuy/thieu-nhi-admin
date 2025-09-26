const StudentScoresPreview = ({ reportData }) => {
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

    // Hàm xác định kết quả
    const getResult = (finalScore) => {
        const score = parseFloat(finalScore) || 0;
        if (score >= 8.5) return 'Ớ Lai';
        if (score >= 6.5) return 'Ở Lại';
        return '';
    };

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
                            <th colSpan="3" className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ffe699]">Điểm Danh</th>
                            <th colSpan="5" className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ddebf7]">Điểm Giáo Lý</th>
                            <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#fffe99] w-20">Điểm Tổng</th>
                            <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#fffe99] w-16">Hạng</th>
                            <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#fffe99] w-20">Kết quả</th>
                        </tr>
                        {/* Header hàng 2 */}
                        <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ffe699] w-20">Đi Lễ T5</th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ffe699] w-20">Học GL</th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ffe699] w-20">Điểm TB</th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ddebf7] w-20">45' HKI</th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ddebf7] w-20">Thi HKI</th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ddebf7] w-20">45' HKII</th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ddebf7] w-20">Thi HKII</th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700 bg-[#ddebf7] w-20">Điểm TB</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => {
                            const result = getResult(student.finalAverage);
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
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#ffe699]">{student.thursdayScore || '0.0'}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#ffe699]">{student.sundayScore || '0.0'}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#ffe699]">{student.attendanceAverage || '0.0'}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#ddebf7]">{student.hk1_45min || '0.0'}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#ddebf7]">{student.hk1_exam || '0.0'}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#ddebf7]">{student.hk2_45min || '0.0'}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#ddebf7]">{student.hk2_exam || '0.0'}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#ddebf7]">{student.studyAverage || '0.0'}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-black bg-[#fffe99]">{student.finalAverage || '0.0'}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900 bg-[#fffe99]">{student.calculatedRank || ''}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-900 bg-[#fffe99]">{result}</td>
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
                        <div className="text-sm text-gray-600">TB Đi Lễ T5</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                            {reportData.statistics.averageStudyScore}
                        </div>
                        <div className="text-sm text-gray-600">TB Học GL</div>
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