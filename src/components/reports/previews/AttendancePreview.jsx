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

    // Group attendance data by student and week (similar to image export logic)
    const attendanceByStudentAndWeek = {};
    const allWeeks = new Map();

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
            columnType = 'sunday';
            representativeDate = recordDate.toISOString().split('T')[0];
        } else {
            columnType = 'thursday';
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

        if (record.isPresent) {
            attendanceByStudentAndWeek[studentId].attendance[columnKey] = true;
        }
    });

    // Sort dates and take last 3 columns
    const sortedColumns = Array.from(allWeeks.entries())
        .sort(([, a], [, b]) => new Date(a.date) - new Date(b.date))
        .slice(-3);

    const students = Object.values(attendanceByStudentAndWeek).slice(0, 50);

    // Get class name
    const className = students.length > 0 ? students[0].student.class.name : 'Không xác định';

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

            {/* Tiêu đề lớp */}
            <div className="text-center py-2 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold">Lớp: {className}</h3>
            </div>

            {/* Bảng điểm danh theo format như xuất ảnh */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">STT</th>
                            <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">Tên thánh</th>
                            <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700" colSpan="2">Họ và tên</th>
                            {sortedColumns.map(([columnKey, columnInfo], index) => {
                                const dateObj = new Date(columnInfo.date);
                                const day = String(dateObj.getDate()).padStart(2, '0');
                                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                return (
                                    <th key={columnKey} className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 bg-green-50">
                                        {day}/{month}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((studentData, index) => {
                            const fullName = studentData.student.fullName || '';
                            const nameParts = fullName.trim().split(' ');
                            const firstName = nameParts[nameParts.length - 1] || '';
                            const lastAndMiddleName = nameParts.slice(0, -1).join(' ') || '';

                            return (
                                <tr key={studentData.student.id}>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">{index + 1}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">{studentData.student.saintName || ''}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-left text-sm text-gray-900 border-r-0 pl-6">{lastAndMiddleName}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900 border-l-0">{firstName}</td>
                                    {sortedColumns.map(([columnKey, columnInfo]) => {
                                        const isPresent = studentData.attendance[columnKey];
                                        const bgColor = isPresent ? '#e8f5e8' : '#fff'; // Màu nền khác nhau nếu có mặt hay không
                                        return (
                                            <td
                                                key={columnKey}
                                                className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-900"
                                                style={{ backgroundColor: bgColor }}
                                            >
                                                {isPresent ? 'X' : ''}
                                            </td>

                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {reportData.attendanceData.length > 50 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                    Hiển thị 50/{reportData.attendanceData.length} học sinh đầu tiên
                    <br />
                    <span className="text-xs">Xuất Excel để xem đầy đủ</span>
                </div>
            )}
        </div>
    );
};

export default AttendancePreview;