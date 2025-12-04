import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Users, Info } from "lucide-react";
import { studentService } from "../../services/studentService";
import StudentAttendanceOverview from "../../components/students/StudentAttendanceOverview";

const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "";

const formatTime = (date) =>
    date
        ? new Date(date).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

const typeMeta = {
    thursday: { label: "Thứ 5", color: "border-purple-200 bg-purple-50", badge: "bg-purple-100 text-purple-700" },
    sunday: { label: "Chủ nhật", color: "border-amber-200 bg-amber-50", badge: "bg-amber-100 text-amber-700" },
};

const StudentAttendancePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStudentAndAttendance = async () => {
            try {
                setLoading(true);
                setError("");

                const studentData = await studentService.getStudentById(id);
                setStudent(studentData);

                const historyParams = {
                    limit: 200,
                };
                if (studentData?.academicYear?.startDate) {
                    historyParams.startDate = studentData.academicYear.startDate;
                }
                if (studentData?.academicYear?.endDate) {
                    historyParams.endDate = studentData.academicYear.endDate;
                }

                const [historyRes, statsRes] = await Promise.all([
                    studentService.getStudentAttendanceHistory(id, historyParams),
                    studentService.getStudentAttendanceStats(id, historyParams),
                ]);

                setAttendanceHistory(historyRes?.records || []);
                setAttendanceStats(statsRes || null);
            } catch (err) {
                setError(err.message || "Không thể tải thông tin thiếu nhi");
            } finally {
                setLoading(false);
            }
        };
        fetchStudentAndAttendance();
    }, [id]);

    const groupedAttendance = useMemo(() => {
        const base = { thursday: [], sunday: [] };
        const source = attendanceHistory.length > 0 ? attendanceHistory : student?.attendance;
        if (!source) return base;
        source.forEach((att) => {
            if (att.attendanceType === "thursday") base.thursday.push(att);
            else if (att.attendanceType === "sunday") base.sunday.push(att);
        });
        return base;
    }, [student, attendanceHistory]);

    const renderList = (list, typeKey) => {
        const meta = typeMeta[typeKey];
        const presentCount = attendanceStats?.typeStats?.[typeKey]?.present ?? list.length;
        return (
            <div className={`border rounded-lg ${meta?.color || "border-gray-200 bg-white"} p-4 space-y-3`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-700" />
                        <h3 className="font-semibold text-gray-800">
                            {meta?.label || "Khác"} ({presentCount})
                        </h3>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${meta?.badge || "bg-gray-100 text-gray-700"}`}>
                        {typeKey}
                    </span>
                </div>
                {list.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có dữ liệu điểm danh.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {list
                            .sort((a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate))
                            .map((att) => (
                                <div
                                    key={att.id}
                                    className="border rounded-lg p-3 bg-white shadow-sm hover:shadow transition-all"
                                    title={`Người điểm danh: ${att.marker?.fullName || "N/A"} | Ghi chú: ${att.note || "Không có"}`}
                                >
                                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        <span>{formatDate(att.attendanceDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Điểm lúc: {formatTime(att.markedAt) || "—"}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {att.note ? (
                                            <span className="line-clamp-2">"{att.note}"</span>
                                        ) : (
                                            <span className="italic text-gray-400">Không có ghi chú</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Điểm danh thiếu nhi</h1>
                    <p className="text-sm text-gray-500">
                        Xem nhanh lịch sử điểm danh theo từng loại.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">
                                    Thiếu nhi: <span className="font-semibold text-gray-900">{student?.fullName}</span> ({student?.studentCode})
                                </p>
                                <p className="text-xs text-gray-500">
                                    Lớp: {student?.class?.name || "N/A"} | Năm học: {student?.academicYear?.name || "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {attendanceStats && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <p className="text-xs text-purple-700 uppercase">Điểm danh T5</p>
                                <div className="text-2xl font-semibold text-purple-800">
                                    {attendanceStats.typeStats?.thursday?.present ?? attendanceStats.student?.thursdayCount ?? 0}
                                </div>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-xs text-amber-700 uppercase">Điểm danh CN</p>
                                <div className="text-2xl font-semibold text-amber-800">
                                    {attendanceStats.typeStats?.sunday?.present ?? attendanceStats.student?.sundayCount ?? 0}
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-xs text-blue-700 uppercase">Điểm TB</p>
                                <div className="text-2xl font-semibold text-blue-800">
                                    {attendanceStats.student?.attendanceAverage?.toFixed
                                        ? attendanceStats.student.attendanceAverage.toFixed(2)
                                        : attendanceStats.student?.attendanceAverage || "—"}
                                </div>
                            </div>
                        </div>
                    )}

                    {student?.academicYear && (
                        <StudentAttendanceOverview
                            attendance={attendanceHistory.length > 0 ? attendanceHistory : (student.attendance || [])}
                            academicYear={student.academicYear}
                        />
                    )}

                    <div className="space-y-4">
                        {renderList(groupedAttendance.thursday, "thursday")}
                        {renderList(groupedAttendance.sunday, "sunday")}
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentAttendancePage;
