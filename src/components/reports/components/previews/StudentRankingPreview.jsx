const StudentRankingPreview = ({ reportData }) => {
    if (!reportData.ranking || reportData.ranking.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">Không có dữ liệu xếp hạng</div>
                <div className="text-gray-400 text-sm">
                    Không tìm thấy dữ liệu học sinh phù hợp với bộ lọc đã chọn
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-center py-2 bg-gray-50 rounded-lg">
                <span className="text-lg font-semibold">
                    Top {Math.min(10, reportData.ranking.length)} thiếu nhi xuất sắc
                </span>
            </div>

            <div className="max-h-96 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạng</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã TN</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm danh</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học tập</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng kết</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.ranking.slice(0, 20).map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        student.rank <= 3 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        #{student.rank}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm font-mono text-blue-600">
                                    {student.studentCode}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {student.fullName}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {student.class.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {student.attendanceAverage}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {student.studyAverage}
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-blue-600">
                                    {student.finalAverage}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                        <div className="text-sm text-gray-600">TB Điểm danh</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                            {reportData.statistics.averageStudyScore}
                        </div>
                        <div className="text-sm text-gray-600">TB Học tập</div>
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

export default StudentRankingPreview;