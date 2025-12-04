import { useState, useEffect } from 'react';
import {
    User,
    Lock,
    Bell,
    Calendar,
    Plus,
    Edit,
    Trash2,
    Check,
    X,
    Calculator,
    AlertCircle, 
    Database
} from 'lucide-react';
import { academicYearService } from '../../services/academicYearService';
import ProfileSettingsSection from '../../components/settings/ProfileSettingsSection';
import SystemSettingsSection from '../../components/settings/SystemSettingsSection';
import PasswordSettingsSection from '../../components/settings/PasswordSettingsSection';

const SettingsPage = ({ user }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [notifications, setNotifications] = useState({
        email: true,
        attendance: true,
        reports: false,
        system: true
    });

    // Academic Year Management States
    const [academicYears, setAcademicYears] = useState([]);
    const [currentAcademicYear, setCurrentAcademicYear] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingYear, setEditingYear] = useState(null);
    const [yearFormData, setYearFormData] = useState({
        name: '',
        startDate: '',
        endDate: ''
    });
    const [error, setError] = useState('');

    const tabs = [
        { id: 'profile', label: 'Thông tin cá nhân', icon: User },
        { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
        { id: 'academic-year', label: 'Năm học', icon: Calendar },
        { id: 'notifications', label: 'Thông báo', icon: Bell },
        { id: 'system', label: 'Hệ thống', icon: Database }
    ];

    useEffect(() => {
        if (activeTab === 'academic-year') {
            fetchAcademicYears();
        }
    }, [activeTab]);

    const fetchAcademicYears = async () => {
        try {
            setLoading(true);
            const [yearsData, currentData] = await Promise.all([
                academicYearService.getAcademicYears(),
                academicYearService.getCurrentAcademicYear().catch(() => null)
            ]);
            setAcademicYears(yearsData);
            setCurrentAcademicYear(currentData);
        } catch (err) {
            setError('Không thể tải danh sách năm học');
        } finally {
            setLoading(false);
        }
    };

    const calculateWeeks = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    };

    const handleCreateYear = async () => {
        try {
            if (!yearFormData.name || !yearFormData.startDate || !yearFormData.endDate) {
                setError('Vui lòng điền đầy đủ thông tin');
                return;
            }

            const startDate = new Date(yearFormData.startDate);
            const endDate = new Date(yearFormData.endDate);

            if (startDate >= endDate) {
                setError('Ngày kết thúc phải sau ngày bắt đầu');
                return;
            }

            setLoading(true);
            await academicYearService.createAcademicYear({
                name: yearFormData.name,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });

            setShowCreateModal(false);
            setYearFormData({ name: '', startDate: '', endDate: '' });
            setError('');
            fetchAcademicYears();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateYear = async () => {
        try {
            if (!yearFormData.name || !yearFormData.startDate || !yearFormData.endDate) {
                setError('Vui lòng điền đầy đủ thông tin');
                return;
            }

            const startDate = new Date(yearFormData.startDate);
            const endDate = new Date(yearFormData.endDate);

            if (startDate >= endDate) {
                setError('Ngày kết thúc phải sau ngày bắt đầu');
                return;
            }

            setLoading(true);
            await academicYearService.updateAcademicYear(editingYear.id, {
                name: yearFormData.name,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });

            setEditingYear(null);
            setYearFormData({ name: '', startDate: '', endDate: '' });
            setError('');
            fetchAcademicYears();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSetCurrent = async (yearId) => {
        try {
            setLoading(true);
            await academicYearService.setCurrentAcademicYear(yearId);
            fetchAcademicYears();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteYear = async (yearId) => {
        if (!confirm('Bạn có chắc muốn xóa năm học này?')) return;
        
        try {
            setLoading(true);
            await academicYearService.deleteAcademicYear(yearId);
            fetchAcademicYears();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRecalculateScores = async (yearId) => {
        if (!confirm('Tính lại điểm cho tất cả học sinh trong năm học này?')) return;
        
        try {
            setLoading(true);
            const result = await academicYearService.recalculateScores(yearId);
            alert(result.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (year) => {
        setEditingYear(year);
        setYearFormData({
            name: year.name,
            startDate: year.startDate.split('T')[0],
            endDate: year.endDate.split('T')[0]
        });
        setError('');
    };

    const cancelEdit = () => {
        setEditingYear(null);
        setYearFormData({ name: '', startDate: '', endDate: '' });
        setError('');
    };

    const handleNotificationsSave = () => {
        alert('Cài đặt đã được lưu!');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-red-100">
                        <div className="p-4">
                            <h3 className="font-medium text-red-800 mb-4">Danh mục</h3>
                            <nav className="space-y-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                                                ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
                                                : 'text-red-600 hover:bg-red-50'
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow-sm border border-red-100 p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 text-red-800">Thông tin cá nhân</h2>
                                <ProfileSettingsSection user={user} />
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 text-red-800">Đổi mật khẩu</h2>
                                <PasswordSettingsSection />
                            </div>
                        )}

                        {/* Academic Year Tab */}
                        {activeTab === 'academic-year' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-red-800">Quản lý năm học</h2>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Thêm năm học
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                        <span className="text-red-700 text-sm">{error}</span>
                                    </div>
                                )}

                                {/* Current Academic Year */}
                                {currentAcademicYear && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-5 h-5 text-green-600" />
                                            <h3 className="font-medium text-green-800">Năm học hiện tại</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-700">
                                            <div>
                                                <span className="font-medium">Tên: </span>
                                                {currentAcademicYear.name}
                                            </div>
                                            <div>
                                                <span className="font-medium">Thời gian: </span>
                                                {new Date(currentAcademicYear.startDate).toLocaleDateString('vi-VN')} - {new Date(currentAcademicYear.endDate).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div>
                                                <span className="font-medium">Tổng tuần: </span>
                                                {currentAcademicYear.totalWeeks} tuần
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Academic Years List */}
                                <div className="space-y-3">
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                            <p className="mt-2 text-red-600">Đang tải...</p>
                                        </div>
                                    ) : academicYears.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            Chưa có năm học nào
                                        </div>
                                    ) : (
                                        academicYears.map(year => (
                                            <div key={year.id} className={`border rounded-lg p-4 ${year.isCurrent ? 'border-green-300 bg-green-50' : 'border-red-200'}`}>
                                                {editingYear?.id === year.id ? (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-red-700 mb-1">Tên năm học</label>
                                                                <input
                                                                    type="text"
                                                                    value={yearFormData.name}
                                                                    onChange={(e) => setYearFormData(prev => ({ ...prev, name: e.target.value }))}
                                                                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                                    placeholder="VD: 2024-2025"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-red-700 mb-1">Ngày bắt đầu</label>
                                                                <input
                                                                    type="date"
                                                                    value={yearFormData.startDate}
                                                                    onChange={(e) => setYearFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                                                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-red-700 mb-1">Ngày kết thúc</label>
                                                                <input
                                                                    type="date"
                                                                    value={yearFormData.endDate}
                                                                    onChange={(e) => setYearFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                                                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        {yearFormData.startDate && yearFormData.endDate && (
                                                            <div className="text-sm text-blue-600">
                                                                Dự kiến: {calculateWeeks(yearFormData.startDate, yearFormData.endDate)} tuần
                                                            </div>
                                                        )}

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleUpdateYear}
                                                                disabled={loading}
                                                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                                Lưu
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium text-red-800">{year.name}</h3>
                                                                {year.isCurrent && (
                                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                                        Hiện tại
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-red-600 mt-1">
                                                                {new Date(year.startDate).toLocaleDateString('vi-VN')} - {new Date(year.endDate).toLocaleDateString('vi-VN')} ({year.totalWeeks} tuần)
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {!year.isCurrent && (
                                                                <button
                                                                    onClick={() => handleSetCurrent(year.id)}
                                                                    className="text-green-600 hover:text-green-800 text-sm"
                                                                    title="Đặt làm năm học hiện tại"
                                                                >
                                                                    Kích hoạt
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleRecalculateScores(year.id)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                                title="Tính lại điểm"
                                                            >
                                                                <Calculator className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => startEdit(year)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteYear(year.id)}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Create Modal */}
                                {showCreateModal && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                        <div className="bg-white rounded-lg w-full max-w-md p-6">
                                            <h3 className="text-lg font-semibold mb-4 text-red-800">Thêm năm học mới</h3>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-red-700 mb-1">Tên năm học</label>
                                                    <input
                                                        type="text"
                                                        value={yearFormData.name}
                                                        onChange={(e) => setYearFormData(prev => ({ ...prev, name: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                        placeholder="VD: 2024-2025"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-red-700 mb-1">Ngày bắt đầu</label>
                                                    <input
                                                        type="date"
                                                        value={yearFormData.startDate}
                                                        onChange={(e) => setYearFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-red-700 mb-1">Ngày kết thúc</label>
                                                    <input
                                                        type="date"
                                                        value={yearFormData.endDate}
                                                        onChange={(e) => setYearFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                    />
                                                </div>
                                                
                                                {yearFormData.startDate && yearFormData.endDate && (
                                                    <div className="text-sm text-blue-600">
                                                        Dự kiến: {calculateWeeks(yearFormData.startDate, yearFormData.endDate)} tuần
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    onClick={() => {
                                                        setShowCreateModal(false);
                                                        setYearFormData({ name: '', startDate: '', endDate: '' });
                                                        setError('');
                                                    }}
                                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={handleCreateYear}
                                                    disabled={loading}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg flex items-center gap-2"
                                                >
                                                    {loading ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Plus className="w-4 h-4" />
                                                    )}
                                                    Tạo
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 text-red-800">Cài đặt thông báo</h2>
                                <div className="space-y-4">
                                    {Object.entries({
                                        email: 'Thông báo qua email',
                                        attendance: 'Nhắc nhở điểm danh',
                                        reports: 'Báo cáo định kỳ',
                                        system: 'Thông báo hệ thống'
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                                            <span className="text-red-800">{label}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications[key]}
                                                    onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={handleNotificationsSave}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Lưu cài đặt
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* System Tab */}
                        {activeTab === 'system' && (
                            <div>
                                <SystemSettingsSection />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
