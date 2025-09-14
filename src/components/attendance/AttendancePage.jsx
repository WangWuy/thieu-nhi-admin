import { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    Users,
    Check,
    X,
    Save,
    Filter,
    Search
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { ATTENDANCE_TYPES } from '../../utils/constants';
import { getAttendanceTypeName } from '../../utils/helpers';
import ImportAttendanceModal from './ImportAttendanceModal';

const AttendancePage = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [classSearch, setClassSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // Helper functions để tính toán ngày và buổi
    const getDateLimits = () => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7

        return {
            maxDate: today.toISOString().split('T')[0], // Chỉ không cho chọn tương lai
            defaultType: currentDay === 0 ? ATTENDANCE_TYPES.SUNDAY : ATTENDANCE_TYPES.THURSDAY
        };
    };

    const dateConfig = useMemo(() => getDateLimits(), []);

    const [filters, setFilters] = useState({
        classId: '',
        date: new Date().toISOString().split('T')[0],
        type: dateConfig.defaultType
    });
    const [attendanceData, setAttendanceData] = useState({});

    // Filter classes dựa trên search
    const filteredClasses = useMemo(() => {
        if (!classSearch.trim()) return classes;

        const searchLower = classSearch.toLowerCase();
        return classes.filter(cls =>
            cls.name.toLowerCase().includes(searchLower) ||
            cls.department.displayName.toLowerCase().includes(searchLower)
        );
    }, [classes, classSearch]);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (filters.classId && filters.date && filters.type) {
            fetchAttendance();
        }
    }, [filters]);

    // Auto update type khi đổi ngày
    useEffect(() => {
        const selectedDate = new Date(filters.date);
        const dayOfWeek = selectedDate.getDay();

        const newType = dayOfWeek === 0 ? ATTENDANCE_TYPES.SUNDAY : ATTENDANCE_TYPES.THURSDAY;

        if (filters.type !== newType) {
            setFilters(prev => ({ ...prev, type: newType }));
        }
    }, [filters.date]);

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

            // Collect student codes from present students (use studentCode directly from data)
            const presentStudentCodes = students
                .filter(student => attendanceData[student.id]?.isPresent)
                .map(student => student.studentCode);

            if (presentStudentCodes.length === 0) {
                alert('Chưa có thiếu nhi nào được đánh dấu có mặt');
                return;
            }

            await attendanceService.universalAttendance({
                studentCodes: presentStudentCodes,
                attendanceDate: filters.date,
                attendanceType: filters.type,
                note: 'Manual attendance marking'
            });

            alert(`Lưu điểm danh thành công cho ${presentStudentCodes.length} thiếu nhi!`);

            // Refresh data
            await fetchAttendance();

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

    const handleClassSelect = (classId) => {
        setFilters(prev => ({ ...prev, classId }));
        setClassSearch(''); // Reset search sau khi chọn
        setShowDropdown(false); // ✅ ẨN DROPDOWN SAU KHI CHỌN
    };

    const handleImportSuccess = async () => {
        // Refresh attendance if same class is selected
        if (filters.classId) {
            await fetchAttendance();
        }
    };

    const presentCount = students.filter(s => attendanceData[s.id]?.isPresent).length;
    const absentCount = students.length - presentCount;

    const selectedClass = classes.find(c => c.id == filters.classId);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-gradient-to-r from-red-50 to-amber-50 p-6 rounded-lg shadow-sm border border-red-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Class Selection with Search */}
                    <div>
                        <label className="block text-sm font-medium text-red-700 mb-2">
                            Lớp *
                        </label>

                        {/* Hiển thị lớp đã chọn hoặc search box */}
                        {filters.classId && !classSearch ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-800">{selectedClass?.name}</div>
                                    <div className="text-xs text-gray-600">{selectedClass?.department.displayName}</div>
                                </div>
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, classId: '' }))}
                                    className="text-gray-400 hover:text-gray-600 ml-2"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm lớp..."
                                        value={classSearch}
                                        onChange={(e) => setClassSearch(e.target.value)}
                                        onFocus={() => setShowDropdown(true)} // ✅ HIỂN THỊ KHI FOCUS
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // ✅ ẨN KHI BLUR VỚI DELAY
                                        className="w-full pl-11 pr-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 search-input"
                                    />
                                </div>

                                {/* ✅ DROPDOWN HIỂN THỊ KHI CÓ SEARCH HOẶC FOCUS */}
                                {(showDropdown || classSearch) && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredClasses.length > 0 ? (
                                            filteredClasses.map(cls => (
                                                <button
                                                    key={cls.id}
                                                    onClick={() => handleClassSelect(cls.id)}
                                                    className="w-full text-left px-3 py-2 border-b border-gray-100 last:border-b-0 btn-gray"
                                                >
                                                    <div className="font-medium text-gray-800">{cls.name}</div>
                                                    <div className="text-xs text-gray-600 mt-1">{cls.department.displayName}</div>
                                                </button>
                                            ))
                                        ) : classSearch ? (
                                            <div className="px-3 py-2 text-gray-500 text-sm">
                                                Không tìm thấy lớp nào
                                            </div>
                                        ) : (
                                            <div className="px-3 py-2 text-gray-500 text-sm">
                                                Gõ để tìm kiếm lớp...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Date with restrictions */}
                    <div>
                        <label className="block text-sm font-medium text-red-700 mb-2">
                            Ngày *
                        </label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                            max={dateConfig.maxDate}
                            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                    </div>

                    {/* Type - Auto selected and locked */}
                    <div>
                        <label className="block text-sm font-medium text-red-700 mb-2">
                            Buổi *
                        </label>
                        <div className="w-full px-3 py-3 border border-red-200 bg-red-50 rounded-lg text-red-700 font-medium">
                            {getAttendanceTypeName(filters.type)}
                        </div>
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
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                            >
                                {/* <Upload className="w-4 h-4" /> */}
                                Import Excel
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
                            Điểm danh {selectedClass?.name} - {getAttendanceTypeName(filters.type)}
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
                    <div className="text-red-500">Không có thiếu nhi nào trong lớp này</div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-red-100">
                    <Calendar className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <div className="text-red-500">Chọn lớp để bắt đầu điểm danh</div>
                </div>
            )}

            <ImportAttendanceModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                filters={filters}
                onImportSuccess={handleImportSuccess}
            />
        </div>
    );
};

export default AttendancePage;