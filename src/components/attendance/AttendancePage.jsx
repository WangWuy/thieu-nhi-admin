import { useState, useEffect } from 'react';
import {
    Calendar,
    Users,
    Check,
    X,
    Save,
    Clock,
    Filter
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { ATTENDANCE_TYPES } from '../../utils/constants';
import { getAttendanceTypeName } from '../../utils/helpers';

const AttendancePage = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        classId: '',
        date: new Date().toISOString().split('T')[0],
        type: ATTENDANCE_TYPES.SUNDAY
    });
    const [attendanceData, setAttendanceData] = useState({});

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (filters.classId && filters.date && filters.type) {
            fetchAttendance();
        }
    }, [filters]);

    const fetchClasses = async () => {
        try {
            const data = await classService.getClasses();
            setClasses(data);
        } catch (err) {
            setError('Không thể tải danh sách lớp');
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const data = await attendanceService.getAttendanceByClass(filters.classId, {
                date: filters.date,
                type: filters.type
            });

            setStudents(data);

            // Convert to attendance data object
            const attendance = {};
            data.forEach(student => {
                attendance[student.id] = {
                    isPresent: student.attendanceRecord?.isPresent || false,
                    note: student.attendanceRecord?.note || ''
                };
            });
            setAttendanceData(attendance);
        } catch (err) {
            setError('Không thể tải dữ liệu điểm danh');
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentId, field, value) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleSaveAttendance = async () => {
        try {
            setSaving(true);

            const attendanceRecords = students.map(student => ({
                studentId: student.id,
                isPresent: attendanceData[student.id]?.isPresent || false,
                note: attendanceData[student.id]?.note || ''
            }));

            await attendanceService.batchMarkAttendance(filters.classId, {
                attendanceDate: filters.date,
                attendanceType: filters.type,
                attendanceRecords
            });

            alert('Lưu điểm danh thành công!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const markAllPresent = () => {
        const newData = {};
        students.forEach(student => {
            newData[student.id] = {
                ...attendanceData[student.id],
                isPresent: true
            };
        });
        setAttendanceData(newData);
    };

    const markAllAbsent = () => {
        const newData = {};
        students.forEach(student => {
            newData[student.id] = {
                ...attendanceData[student.id],
                isPresent: false
            };
        });
        setAttendanceData(newData);
    };

    const presentCount = students.filter(s => attendanceData[s.id]?.isPresent).length;
    const absentCount = students.length - presentCount;

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-gradient-to-r from-red-50 to-amber-50 p-6 rounded-lg shadow-sm border border-red-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-red-700 mb-2">
                            Lớp *
                        </label>
                        <select
                            value={filters.classId}
                            onChange={(e) => setFilters(prev => ({ ...prev, classId: e.target.value }))}
                            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">Chọn lớp</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} ({cls.department.displayName})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-red-700 mb-2">
                            Ngày *
                        </label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-red-700 mb-2">
                            Buổi *
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value={ATTENDANCE_TYPES.THURSDAY}>Thứ 5</option>
                            <option value={ATTENDANCE_TYPES.SUNDAY}>Chủ nhật</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={fetchAttendance}
                            disabled={!filters.classId || loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Tải dữ liệu
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Stats & Actions */}
            {students.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                                <div className="text-sm text-green-700">Có mặt</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                                <div className="text-sm text-red-700">Vắng mặt</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                                <div className="text-sm text-blue-700">Tổng số</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={markAllPresent}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Có mặt tất cả
                            </button>
                            <button
                                onClick={markAllAbsent}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Vắng tất cả
                            </button>
                            <button
                                onClick={handleSaveAttendance}
                                disabled={saving}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Lưu điểm danh
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance List */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-red-100 rounded animate-pulse"></div>
                    ))}
                </div>
            ) : students.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-red-100">
                    <div className="p-4 border-b border-red-100">
                        <h3 className="font-medium text-red-800">
                            Điểm danh {filters.classId && classes.find(c => c.id == filters.classId)?.name} - {getAttendanceTypeName(filters.type)}
                        </h3>
                        <p className="text-sm text-red-600">
                            Ngày: {new Date(filters.date).toLocaleDateString('vi-VN')}
                        </p>
                    </div>

                    <div className="divide-y divide-red-100">
                        {students.map((student) => (
                            <div key={student.id} className="p-4 hover:bg-red-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-red-800">
                                                {student.saintName && `${student.saintName} `}{student.fullName}
                                            </div>
                                            <div className="text-sm text-red-500">{student.studentCode}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleAttendanceChange(student.id, 'isPresent', true)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${attendanceData[student.id]?.isPresent
                                                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                                                    }`}
                                            >
                                                <Check className="w-4 h-4 inline mr-1" />
                                                Có mặt
                                            </button>
                                            <button
                                                onClick={() => handleAttendanceChange(student.id, 'isPresent', false)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${attendanceData[student.id]?.isPresent === false
                                                    ? 'bg-red-100 text-red-800 border-2 border-red-300'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                                                    }`}
                                            >
                                                <X className="w-4 h-4 inline mr-1" />
                                                Vắng
                                            </button>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Ghi chú..."
                                            value={attendanceData[student.id]?.note || ''}
                                            onChange={(e) => handleAttendanceChange(student.id, 'note', e.target.value)}
                                            className="w-32 px-3 py-1 text-sm border border-red-200 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : filters.classId ? (
                <div className="text-center py-12 bg-white rounded-lg border border-red-100">
                    <Users className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <div className="text-red-500">Không có học sinh nào trong lớp này</div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-red-100">
                    <Calendar className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <div className="text-red-500">Chọn lớp để bắt đầu điểm danh</div>
                </div>
            )}
        </div>
    );
};

export default AttendancePage;