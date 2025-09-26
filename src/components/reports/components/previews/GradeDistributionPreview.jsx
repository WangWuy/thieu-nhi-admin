const GradeDistributionPreview = ({ reportData }) => {
    if (!reportData.distribution || reportData.totalStudents === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">Không có dữ liệu phân bố điểm</div>
                <div className="text-gray-400 text-sm">
                    Không tìm thấy dữ liệu học sinh phù hợp với bộ lọc đã chọn
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-center py-2 bg-gray-50 rounded-lg mb-4">
                <span className="text-lg font-semibold">
                    Tổng: {reportData.totalStudents} thiếu nhi
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Điểm điểm danh</h4>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Xuất sắc (≥8.5):</span>
                            <span className="font-medium">{reportData.distribution?.attendance?.excellent || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Khá (7.0-8.4):</span>
                            <span className="font-medium">{reportData.distribution?.attendance?.good || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>TB (5.5-6.9):</span>
                            <span className="font-medium">{reportData.distribution?.attendance?.average || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Yếu ({'<'}5.5):</span>
                            <span className="font-medium">{reportData.distribution?.attendance?.weak || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Điểm học tập</h4>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Xuất sắc (≥8.5):</span>
                            <span className="font-medium">{reportData.distribution?.study?.excellent || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Khá (7.0-8.4):</span>
                            <span className="font-medium">{reportData.distribution?.study?.good || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>TB (5.5-6.9):</span>
                            <span className="font-medium">{reportData.distribution?.study?.average || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Yếu ({'<'}5.5):</span>
                            <span className="font-medium">{reportData.distribution?.study?.weak || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Điểm tổng kết</h4>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Xuất sắc (≥8.5):</span>
                            <span className="font-medium">{reportData.distribution?.final?.excellent || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Khá (7.0-8.4):</span>
                            <span className="font-medium">{reportData.distribution?.final?.good || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>TB (5.5-6.9):</span>
                            <span className="font-medium">{reportData.distribution?.final?.average || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Yếu ({'<'}5.5):</span>
                            <span className="font-medium">{reportData.distribution?.final?.weak || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thống kê theo ngành */}
            {reportData.departmentStats && Object.keys(reportData.departmentStats).length > 0 && (
                <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Thống kê theo ngành:</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngành</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SL TN</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TB Điểm danh</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TB Học tập</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TB Tổng</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.entries(reportData.departmentStats).map(([deptName, stats]) => (
                                    <tr key={deptName} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{deptName}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{stats.totalStudents}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{stats.averageAttendance}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{stats.averageStudy}</td>
                                        <td className="px-4 py-2 text-sm font-bold text-blue-600">{stats.averageFinal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradeDistributionPreview;