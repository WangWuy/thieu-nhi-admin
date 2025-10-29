import { 
    groupAttendanceByStudentAndWeek,
    mergeAndSortStudents,
    getSortedColumns,
    getClassName,
    parseStudentName
} from '../../../utils/attendancePreviewUtils';

const AttendancePreview = ({ reportData }) => {
    // Group attendance data by student and week using utils
    const { attendanceByStudentAndWeek, allWeeks } = groupAttendanceByStudentAndWeek(
        reportData.attendanceData || []
    );

    // Merge and sort all students using utils
    const sortedStudents = mergeAndSortStudents(
        attendanceByStudentAndWeek,
        reportData.studentsWithoutAttendanceList || []
    );

    // Get sorted columns (last 5) or default columns using utils
    const sortedColumns = getSortedColumns(allWeeks, reportData.filters);

    // Display first 50 students
    const displayStudents = sortedStudents.slice(0, 50);

    // Get class name using utils
    const className = getClassName(displayStudents, reportData.studentsWithoutAttendanceList);

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
                <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                        {reportData.studentsWithoutAttendance || 0}
                    </div>
                    <div className="text-sm text-gray-600">Học sinh chưa điểm danh</div>
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

            {/* Bảng điểm danh */}
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
                        {displayStudents.map((studentData, index) => {
                            const { firstName, lastAndMiddleName } = parseStudentName(studentData.student.fullName);

                            return (
                                <tr key={studentData.student.id}>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">{index + 1}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">{studentData.student.saintName || ''}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-left text-sm text-gray-900 border-r-0 pl-6">{lastAndMiddleName}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900 border-l-0">{firstName}</td>
                                    {sortedColumns.map(([columnKey, columnInfo]) => {
                                        const isPresent = studentData.attendance[columnKey];
                                        const bgColor = isPresent ? '#e8f5e8' : '#fff';
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

            {sortedStudents.length > 50 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                    Hiển thị 50/{sortedStudents.length} học sinh đầu tiên
                    <br />
                    <span className="text-xs">Xuất Excel để xem đầy đủ</span>
                </div>
            )}
        </div>
    );
};

export default AttendancePreview;