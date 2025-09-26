const AttendancePreview = ({ reportData }) => {
    if (!reportData.attendanceData || reportData.attendanceData.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">Không có dữ liệu điểm danh</div>
                <div className="text-gray-400 text-sm">
                    Không tìm thấy dữ liệu điểm danh trong khoảng thời gian đã chọn
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Tóm tắt nhanh */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                        {reportData.summary?.thursday?.present || 0}
                    </div>
                    <div className="text-sm text-gray-600">Có mặt thứ 5</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                        {reportData.summary?.sunday?.present || 0}
                    </div>
                    <div className="text-sm text-gray-600">Có mặt CN</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                        {Object.keys(reportData.attendanceByDate || {}).length}
                    </div>
                    <div className="text-sm text-gray-600">Số ngày có điểm danh</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                        {reportData.totalRecords || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tổng lượt điểm danh</div>
                </div>
            </div>

            {/* Bảng điểm danh chi tiết */}
            <div className="max-h-96 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã TN</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học sinh</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.attendanceData.slice(0, 50).map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {new Date(record.attendanceDate).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {record.attendanceType === 'thursday' ? 'Thứ 5' : 'Chủ nhật'}
                                </td>
                                <td className="px-4 py-3 text-sm font-mono text-blue-600">
                                    {record.student.studentCode}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {record.student.fullName}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {record.student.class.name}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        record.isPresent
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {record.isPresent ? 'Có mặt' : 'Vắng mặt'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reportData.attendanceData.length > 50 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        Và {reportData.attendanceData.length - 50} bản ghi khác...
                        <br />
                        <span className="text-xs">Xuất Excel để xem đầy đủ</span>
                    </div>
                )}
            </div>

            {/* Tóm tắt mã thiếu nhi theo ngày */}
            {reportData.attendanceByDate && Object.keys(reportData.attendanceByDate).length > 0 && (
                <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                        Tóm tắt mã thiếu nhi có mặt theo ngày (10 ngày gần nhất):
                    </h4>
                    <div className="space-y-3">
                        {Object.values(reportData.attendanceByDate)
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 10)
                            .map((dayData, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-medium text-gray-900">
                                            {new Date(dayData.date).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            dayData.type === 'thursday'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {dayData.type === 'thursday' ? 'Thứ 5' : 'Chủ nhật'}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            ({dayData.studentCodes.length} thiếu nhi)
                                        </span>
                                    </div>
                                    <div className="bg-white p-2 rounded border">
                                        <span className="font-mono text-xs text-gray-700">
                                            {dayData.studentCodes.join(', ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendancePreview;