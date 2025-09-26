const OverviewPreview = ({ reportData }) => {
    return (
        <div className="space-y-6">
            {/* Tóm tắt chính */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                        {reportData.summary?.totalStudents || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tổng thiếu nhi</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                        {reportData.summary?.totalClasses || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tổng lớp học</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                        {reportData.summary?.totalDepartments || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tổng ngành</div>
                </div>
            </div>

            {/* Điểm trung bình */}
            <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3">Điểm trung bình toàn trường:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">
                            {reportData.summary?.scoreAverages?.attendance || '0.0'}
                        </div>
                        <div className="text-sm text-gray-600">Điểm danh</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                            {reportData.summary?.scoreAverages?.study || '0.0'}
                        </div>
                        <div className="text-sm text-gray-600">Học tập</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">
                            {reportData.summary?.scoreAverages?.final || '0.0'}
                        </div>
                        <div className="text-sm text-gray-600">Tổng kết</div>
                    </div>
                </div>
            </div>

            {/* Điểm danh gần đây */}
            {reportData.recentAttendance && (
                <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-3">Điểm danh 30 ngày gần nhất:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                                {reportData.recentAttendance.thursday?.present || 0}
                            </div>
                            <div className="text-sm text-gray-600">Có mặt Thứ 5</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                            <div className="text-lg font-bold text-red-600">
                                {reportData.recentAttendance.thursday?.absent || 0}
                            </div>
                            <div className="text-sm text-gray-600">Vắng Thứ 5</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                                {reportData.recentAttendance.sunday?.present || 0}
                            </div>
                            <div className="text-sm text-gray-600">Có mặt CN</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="text-lg font-bold text-orange-600">
                                {reportData.recentAttendance.sunday?.absent || 0}
                            </div>
                            <div className="text-sm text-gray-600">Vắng CN</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Thông tin cập nhật */}
            <div className="text-center text-sm text-gray-500">
                Báo cáo được tạo lúc: {reportData.lastUpdated 
                    ? new Date(reportData.lastUpdated).toLocaleString('vi-VN')
                    : 'Không xác định'
                }
            </div>
        </div>
    );
};

export default OverviewPreview;