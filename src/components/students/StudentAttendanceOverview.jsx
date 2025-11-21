import { useMemo } from "react";
import { CalendarCheck, CheckCircle2 } from "lucide-react";

const calculateWeekNumber = (attendanceDate, startDate) => {
    if (!attendanceDate || !startDate) return null;
    const start = new Date(startDate);
    const current = new Date(attendanceDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(current.getTime())) return null;

    const diffDays = Math.floor((current - start) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
};

const buildAttendanceMap = (attendance = [], type, startDate, totalWeeks) => {
    const map = new Map();
    attendance
        .filter((item) => item.attendanceType === type && item.isPresent)
        .forEach((item) => {
            const weekNumber = calculateWeekNumber(item.attendanceDate, startDate);
            if (weekNumber && weekNumber >= 1 && weekNumber <= totalWeeks) {
                map.set(weekNumber, true);
            }
        });
    return map;
};

const StudentAttendanceOverview = ({ attendance = [], academicYear }) => {
    const totalWeeks = academicYear?.totalWeeks || 0;
    const startDate = academicYear?.startDate;

    const weeks = useMemo(
        () => Array.from({ length: totalWeeks }, (_, index) => index + 1),
        [totalWeeks]
    );

    const thursdayMap = useMemo(
        () => buildAttendanceMap(attendance, "thursday", startDate, totalWeeks),
        [attendance, startDate, totalWeeks]
    );
    const sundayMap = useMemo(
        () => buildAttendanceMap(attendance, "sunday", startDate, totalWeeks),
        [attendance, startDate, totalWeeks]
    );

    if (!totalWeeks || !startDate) {
        return (
            <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                    <CalendarCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-medium text-indigo-800">Điểm danh</h3>
                </div>
                <p className="text-sm text-gray-600">
                    Chưa có dữ liệu năm học để hiển thị tiến độ điểm danh.
                </p>
            </div>
        );
    }

    const renderRow = (label, map, accentClasses) => (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${accentClasses.badge}`}>
                        {label}
                    </span>
                    <span className="text-sm text-gray-600">
                        {map.size}/{totalWeeks} buổi
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <span className={`w-3 h-3 inline-block rounded ${accentClasses.cell}`}></span>
                        Có mặt
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 inline-block rounded bg-gray-100 border border-gray-200"></span>
                        Chưa có
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {weeks.map((week) => {
                    const isPresent = map.has(week);
                    return (
                        <div
                            key={`${label}-${week}`}
                            className={`h-14 rounded border text-xs flex flex-col items-center justify-center ${
                                isPresent
                                    ? `${accentClasses.cell} ${accentClasses.text} border-current`
                                    : "bg-gray-50 border-gray-200 text-gray-400"
                            }`}
                        >
                            <div className="font-semibold">Tuần {week}</div>
                            {isPresent ? (
                                <CheckCircle2 className="w-4 h-4 mt-1" />
                            ) : (
                                <span className="mt-1">--</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-lg border space-y-4">
            <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
                <div>
                    <h3 className="text-lg font-medium text-indigo-800">Tiến độ điểm danh</h3>
                    <p className="text-xs text-gray-500">
                        Hiển thị theo tuần của năm học {academicYear?.name}
                    </p>
                </div>
            </div>

            {renderRow("Thứ 5", thursdayMap, {
                badge: "bg-purple-100 text-purple-700",
                cell: "bg-purple-50 border-purple-400",
                text: "text-purple-700",
            })}

            {renderRow("Chủ nhật", sundayMap, {
                badge: "bg-amber-100 text-amber-700",
                cell: "bg-amber-50 border-amber-400",
                text: "text-amber-700",
            })}
        </div>
    );
};

export default StudentAttendanceOverview;
