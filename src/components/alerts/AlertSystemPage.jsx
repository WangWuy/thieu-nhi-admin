import { useState, useEffect } from 'react';
import {
    Bell,
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle,
    X,
    Settings,
    Plus,
    Edit,
    Trash2,
    Filter,
    RefreshCw,
    BellRing,
    Clock,
    Users,
    TrendingDown,
    Calendar,
    Mail,
    Smartphone
} from 'lucide-react';
import { reportsService } from '../../services/reportsService';
import { dashboardService } from '../../services/dashboardService';
import AlertRulesManager from './AlertRulesManager';

const AlertSystemPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [alerts, setAlerts] = useState([]);
    const [alertRules, setAlertRules] = useState([]);
    const [activeTab, setActiveTab] = useState('alerts');
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [showRulesManager, setShowRulesManager] = useState(false);
    
    const [filters, setFilters] = useState({
        priority: 'all', // all, high, medium, low
        status: 'all', // all, unread, read, resolved
        type: 'all', // all, attendance, grades, system
        timeRange: '7days'
    });

    const [alertStats, setAlertStats] = useState({
        total: 0,
        unread: 0,
        high: 0,
        resolved: 0
    });

    useEffect(() => {
        fetchAlerts();
        fetchAlertRules();
        // Set up auto-refresh every 5 minutes
        const interval = setInterval(() => {
            fetchAlerts();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchAlerts();
    }, [filters]);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            setError('');

            // Since we don't have a real alert API yet, we'll generate alerts based on current data
            const generatedAlerts = await generateAlertsFromData();
            
            // Apply filters
            const filteredAlerts = applyFilters(generatedAlerts);
            setAlerts(filteredAlerts);

            // Update stats
            updateAlertStats(generatedAlerts);

        } catch (err) {
            setError(err.message || 'Không thể tải cảnh báo');
            // Use mock data on error
            const mockAlerts = generateMockAlerts();
            setAlerts(mockAlerts);
            updateAlertStats(mockAlerts);
        } finally {
            setLoading(false);
        }
    };

    const fetchAlertRules = async () => {
        try {
            // Mock alert rules - in real app this would come from API
            const mockRules = [
                {
                    id: 1,
                    name: 'Tỷ lệ điểm danh thấp',
                    type: 'attendance',
                    condition: 'attendance_rate < 70',
                    threshold: 70,
                    priority: 'high',
                    enabled: true,
                    notification: ['email', 'system'],
                    description: 'Cảnh báo khi tỷ lệ điểm danh dưới 70%'
                },
                {
                    id: 2,
                    name: 'Điểm học tập giảm',
                    type: 'grades',
                    condition: 'study_score < 6.0',
                    threshold: 6.0,
                    priority: 'medium',
                    enabled: true,
                    notification: ['system'],
                    description: 'Cảnh báo khi điểm học tập dưới 6.0'
                },
                {
                    id: 3,
                    name: 'Vắng mặt liên tục',
                    type: 'attendance',
                    condition: 'consecutive_absent >= 3',
                    threshold: 3,
                    priority: 'high',
                    enabled: true,
                    notification: ['email', 'sms', 'system'],
                    description: 'Cảnh báo khi thiếu nhi vắng mặt 3 buổi liên tục'
                },
                {
                    id: 4,
                    name: 'Lớp ít thiếu nhi',
                    type: 'system',
                    condition: 'class_size < 10',
                    threshold: 10,
                    priority: 'low',
                    enabled: false,
                    notification: ['system'],
                    description: 'Cảnh báo khi lớp có ít hơn 10 thiếu nhi'
                }
            ];
            setAlertRules(mockRules);
        } catch (err) {
            console.warn('Could not fetch alert rules:', err);
        }
    };

    const generateAlertsFromData = async () => {
        const alerts = [];
        
        try {
            // Get dashboard data for analysis
            const dashboardData = await dashboardService.getDashboardStats();
            
            if (dashboardData?.departmentStats) {
                dashboardData.departmentStats.forEach(dept => {
                    // Low attendance alert
                    if (dept.averageAttendance && dept.averageAttendance < 7.5) {
                        alerts.push({
                            id: `att_${dept.id}_${Date.now()}`,
                            type: 'attendance',
                            priority: 'high',
                            title: `Tỷ lệ điểm danh thấp - ${dept.displayName}`,
                            message: `Ngành ${dept.displayName} có tỷ lệ điểm danh trung bình ${(dept.averageAttendance * 10).toFixed(1)}%, thấp hơn ngưỡng 75%`,
                            timestamp: new Date(),
                            status: 'unread',
                            source: 'system',
                            data: { departmentId: dept.id, value: dept.averageAttendance * 10 }
                        });
                    }

                    // Low study score alert
                    if (dept.averageStudyScore && dept.averageStudyScore < 7.0) {
                        alerts.push({
                            id: `study_${dept.id}_${Date.now()}`,
                            type: 'grades',
                            priority: 'medium',
                            title: `Điểm học tập cần cải thiện - ${dept.displayName}`,
                            message: `Ngành ${dept.displayName} có điểm học tập trung bình ${dept.averageStudyScore.toFixed(1)}, thấp hơn ngưỡng 7.0`,
                            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                            status: Math.random() > 0.5 ? 'unread' : 'read',
                            source: 'system',
                            data: { departmentId: dept.id, value: dept.averageStudyScore }
                        });
                    }
                });
            }

            // Add some system alerts
            alerts.push({
                id: `sys_${Date.now()}`,
                type: 'system',
                priority: 'low',
                title: 'Báo cáo tuần đã sẵn sàng',
                message: 'Báo cáo tổng kết tuần đã được tạo và sẵn sàng để xem',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                status: 'read',
                source: 'system',
                data: { reportType: 'weekly' }
            });

        } catch (err) {
            console.warn('Error generating alerts from data:', err);
        }

        // If no real alerts, add some mock ones
        if (alerts.length === 0) {
            return generateMockAlerts();
        }

        return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };

    const generateMockAlerts = () => [
        {
            id: 1,
            type: 'attendance',
            priority: 'high',
            title: 'Tỷ lệ điểm danh thấp - Ngành Thiếu Nhi',
            message: 'Ngành Thiếu Nhi có tỷ lệ điểm danh tuần này chỉ 68%, thấp hơn ngưỡng cảnh báo 70%',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            status: 'unread',
            source: 'system',
            data: { departmentId: 3, value: 68 }
        },
        {
            id: 2,
            type: 'grades',
            priority: 'medium',
            title: 'Điểm học tập giảm - Lớp B2',
            message: 'Lớp B2 có điểm học tập trung bình giảm xuống 5.8, cần quan tâm hỗ trợ thêm',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'unread',
            source: 'teacher_report',
            data: { classId: 12, value: 5.8 }
        },
        {
            id: 3,
            type: 'attendance',
            priority: 'high',
            title: 'Thiếu nhi vắng mặt liên tục',
            message: 'Nguyễn Văn A (Lớp A1) đã vắng mặt 4 buổi liên tục, cần liên hệ phụ huynh',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            status: 'read',
            source: 'attendance_system',
            data: { studentId: 123, consecutiveAbsent: 4 }
        },
        {
            id: 4,
            type: 'system',
            priority: 'low',
            title: 'Cập nhật hệ thống',
            message: 'Hệ thống đã được cập nhật phiên bản mới với các tính năng báo cáo nâng cao',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: 'resolved',
            source: 'system',
            data: { version: '1.2.0' }
        },
        {
            id: 5,
            type: 'attendance',
            priority: 'medium',
            title: 'Tỷ lệ điểm danh Chủ nhật thấp',
            message: 'Tỷ lệ điểm danh Chủ nhật tuần này chỉ 72%, thấp hơn so với Thứ 5 (85%)',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'read',
            source: 'system',
            data: { sundayRate: 72, thursdayRate: 85 }
        }
    ];

    const applyFilters = (allAlerts) => {
        return allAlerts.filter(alert => {
            if (filters.priority !== 'all' && alert.priority !== filters.priority) return false;
            if (filters.status !== 'all' && alert.status !== filters.status) return false;
            if (filters.type !== 'all' && alert.type !== filters.type) return false;
            
            // Time range filter
            const alertTime = new Date(alert.timestamp);
            const now = new Date();
            const timeRanges = {
                '1day': 1,
                '7days': 7,
                '30days': 30,
                'all': 365
            };
            const daysAgo = timeRanges[filters.timeRange] || 7;
            const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            
            if (alertTime < cutoff) return false;
            
            return true;
        });
    };

    const updateAlertStats = (allAlerts) => {
        const stats = {
            total: allAlerts.length,
            unread: allAlerts.filter(a => a.status === 'unread').length,
            high: allAlerts.filter(a => a.priority === 'high').length,
            resolved: allAlerts.filter(a => a.status === 'resolved').length
        };
        setAlertStats(stats);
    };

    const markAsRead = async (alertId) => {
        setAlerts(prev => prev.map(alert => 
            alert.id === alertId ? { ...alert, status: 'read' } : alert
        ));
    };

    const markAsResolved = async (alertId) => {
        setAlerts(prev => prev.map(alert => 
            alert.id === alertId ? { ...alert, status: 'resolved' } : alert
        ));
    };

    const dismissAlert = async (alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };

    const getAlertIcon = (type, priority) => {
        const iconProps = { className: "w-5 h-5" };
        
        if (priority === 'high') {
            return <AlertTriangle {...iconProps} className="w-5 h-5 text-red-500" />;
        } else if (priority === 'medium') {
            return <AlertCircle {...iconProps} className="w-5 h-5 text-yellow-500" />;
        } else {
            return <Info {...iconProps} className="w-5 h-5 text-blue-500" />;
        }
    };

    const getAlertColor = (priority, status) => {
        if (status === 'resolved') return 'bg-gray-50 border-gray-200';
        
        switch (priority) {
            case 'high':
                return 'bg-red-50 border-red-200';
            case 'medium':
                return 'bg-yellow-50 border-yellow-200';
            case 'low':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} ngày trước`;
    };

    const tabs = [
        { id: 'alerts', label: 'Cảnh báo', icon: Bell, count: alertStats.unread },
        { id: 'rules', label: 'Quy tắc', icon: Settings, count: alertRules.filter(r => r.enabled).length },
        { id: 'history', label: 'Lịch sử', icon: Clock, count: alertStats.resolved }
    ];

    const priorityOptions = [
        { value: 'all', label: 'Tất cả mức độ' },
        { value: 'high', label: 'Cao', color: 'text-red-600' },
        { value: 'medium', label: 'Trung bình', color: 'text-yellow-600' },
        { value: 'low', label: 'Thấp', color: 'text-blue-600' }
    ];

    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái' },
        { value: 'unread', label: 'Chưa đọc', color: 'text-red-600' },
        { value: 'read', label: 'Đã đọc', color: 'text-gray-600' },
        { value: 'resolved', label: 'Đã xử lý', color: 'text-green-600' }
    ];

    const typeOptions = [
        { value: 'all', label: 'Tất cả loại' },
        { value: 'attendance', label: 'Điểm danh', icon: Users },
        { value: 'grades', label: 'Điểm số', icon: TrendingDown },
        { value: 'system', label: 'Hệ thống', icon: Settings }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Hệ thống cảnh báo và thông báo tự động</span>
                </div>
                <button
                    onClick={fetchAlerts}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng cảnh báo</p>
                            <p className="text-2xl font-bold text-gray-900">{alertStats.total}</p>
                        </div>
                        <Bell className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Chưa đọc</p>
                            <p className="text-2xl font-bold text-red-600">{alertStats.unread}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Mức độ cao</p>
                            <p className="text-2xl font-bold text-orange-600">{alertStats.high}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Đã xử lý</p>
                            <p className="text-2xl font-bold text-green-600">{alertStats.resolved}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'alerts' && (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                <select
                                    value={filters.priority}
                                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {priorityOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {typeOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.timeRange}
                                    onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="1day">Hôm nay</option>
                                    <option value="7days">7 ngày qua</option>
                                    <option value="30days">30 ngày qua</option>
                                    <option value="all">Tất cả</option>
                                </select>
                            </div>

                            {/* Alerts List */}
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-8">
                                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                                        <p className="text-gray-500">Đang tải cảnh báo...</p>
                                    </div>
                                ) : alerts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Không có cảnh báo nào</p>
                                    </div>
                                ) : alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${getAlertColor(alert.priority, alert.status)} ${
                                            alert.status === 'unread' ? 'border-l-4' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                {getAlertIcon(alert.type, alert.priority)}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                            alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {alert.priority === 'high' ? 'Cao' : alert.priority === 'medium' ? 'TB' : 'Thấp'}
                                                        </span>
                                                        {alert.status === 'unread' && (
                                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-700 text-sm mb-2">{alert.message}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatTimeAgo(alert.timestamp)}
                                                        </span>
                                                        <span>Nguồn: {alert.source}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {alert.status === 'unread' && (
                                                    <button
                                                        onClick={() => markAsRead(alert.id)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                        title="Đánh dấu đã đọc"
                                                    >
                                                        Đã đọc
                                                    </button>
                                                )}
                                                {alert.status !== 'resolved' && (
                                                    <button
                                                        onClick={() => markAsResolved(alert.id)}
                                                        className="text-green-600 hover:text-green-800 text-sm"
                                                        title="Đánh dấu đã xử lý"
                                                    >
                                                        Xử lý
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => dismissAlert(alert.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                    title="Ẩn cảnh báo"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'rules' && (
                        <AlertRulesManager
                            rules={alertRules}
                            onRulesChange={setAlertRules}
                            onRefreshAlerts={fetchAlerts}
                        />
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <div className="text-center py-8">
                                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Lịch sử cảnh báo sẽ được hiển thị ở đây</p>
                                <p className="text-sm text-gray-400">Bao gồm các cảnh báo đã xử lý và đã ẩn</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                        <p className="text-red-800 font-medium">Lỗi hệ thống cảnh báo</p>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertSystemPage;