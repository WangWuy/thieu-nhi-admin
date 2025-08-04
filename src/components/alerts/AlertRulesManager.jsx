import { useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Settings,
    Users,
    TrendingDown,
    Mail,
    Smartphone,
    Monitor,
    ToggleLeft,
    ToggleRight,
    Save,
    X,
    AlertTriangle
} from 'lucide-react';

const AlertRulesManager = ({ rules, onRulesChange, onRefreshAlerts }) => {
    const [editingRule, setEditingRule] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'attendance',
        condition: '',
        threshold: 0,
        priority: 'medium',
        enabled: true,
        notification: ['system'],
        description: ''
    });

    const ruleTypes = [
        { value: 'attendance', label: 'Điểm danh', icon: Users },
        { value: 'grades', label: 'Điểm số', icon: TrendingDown },
        { value: 'system', label: 'Hệ thống', icon: Settings }
    ];

    const priorityLevels = [
        { value: 'high', label: 'Cao', color: 'text-red-600 bg-red-100' },
        { value: 'medium', label: 'Trung bình', color: 'text-yellow-600 bg-yellow-100' },
        { value: 'low', label: 'Thấp', color: 'text-blue-600 bg-blue-100' }
    ];

    const notificationTypes = [
        { value: 'system', label: 'Hệ thống', icon: Monitor },
        { value: 'email', label: 'Email', icon: Mail },
        { value: 'sms', label: 'SMS', icon: Smartphone }
    ];

    const conditionTemplates = {
        attendance: [
            { value: 'attendance_rate < {threshold}', label: 'Tỷ lệ điểm danh thấp hơn' },
            { value: 'consecutive_absent >= {threshold}', label: 'Vắng mặt liên tục từ' },
            { value: 'sunday_rate < thursday_rate - {threshold}', label: 'CN thấp hơn T5 từ' }
        ],
        grades: [
            { value: 'study_score < {threshold}', label: 'Điểm học tập thấp hơn' },
            { value: 'final_score < {threshold}', label: 'Điểm tổng thấp hơn' },
            { value: 'score_decline >= {threshold}', label: 'Điểm giảm từ' }
        ],
        system: [
            { value: 'class_size < {threshold}', label: 'Sĩ số lớp ít hơn' },
            { value: 'teacher_ratio > {threshold}', label: 'Tỷ lệ GV/TN cao hơn' },
            { value: 'data_missing >= {threshold}', label: 'Thiếu dữ liệu từ ngày' }
        ]
    };

    const handleCreateRule = () => {
        setShowCreateForm(true);
        setFormData({
            name: '',
            type: 'attendance',
            condition: '',
            threshold: 0,
            priority: 'medium',
            enabled: true,
            notification: ['system'],
            description: ''
        });
    };

    const handleEditRule = (rule) => {
        setEditingRule(rule.id);
        setFormData({
            name: rule.name,
            type: rule.type,
            condition: rule.condition,
            threshold: rule.threshold,
            priority: rule.priority,
            enabled: rule.enabled,
            notification: rule.notification,
            description: rule.description
        });
    };

    const handleSaveRule = () => {
        if (editingRule) {
            // Update existing rule
            const updatedRules = rules.map(rule => 
                rule.id === editingRule 
                    ? { ...rule, ...formData, id: editingRule }
                    : rule
            );
            onRulesChange(updatedRules);
            setEditingRule(null);
        } else {
            // Create new rule
            const newRule = {
                ...formData,
                id: Date.now(), // Simple ID generation
            };
            onRulesChange([...rules, newRule]);
            setShowCreateForm(false);
        }
        
        // Refresh alerts to apply new rules
        onRefreshAlerts();
    };

    const handleDeleteRule = (ruleId) => {
        if (confirm('Bạn có chắc muốn xóa quy tắc này?')) {
            const updatedRules = rules.filter(rule => rule.id !== ruleId);
            onRulesChange(updatedRules);
            onRefreshAlerts();
        }
    };

    const handleToggleRule = (ruleId) => {
        const updatedRules = rules.map(rule => 
            rule.id === ruleId 
                ? { ...rule, enabled: !rule.enabled }
                : rule
        );
        onRulesChange(updatedRules);
        onRefreshAlerts();
    };

    const handleCancel = () => {
        setEditingRule(null);
        setShowCreateForm(false);
        setFormData({
            name: '',
            type: 'attendance',
            condition: '',
            threshold: 0,
            priority: 'medium',
            enabled: true,
            notification: ['system'],
            description: ''
        });
    };

    const handleNotificationChange = (notificationType) => {
        setFormData(prev => ({
            ...prev,
            notification: prev.notification.includes(notificationType)
                ? prev.notification.filter(n => n !== notificationType)
                : [...prev.notification, notificationType]
        }));
    };

    const handleConditionTemplateSelect = (template) => {
        setFormData(prev => ({
            ...prev,
            condition: template.replace('{threshold}', prev.threshold)
        }));
    };

    const getRuleTypeIcon = (type) => {
        const typeConfig = ruleTypes.find(t => t.value === type);
        if (!typeConfig) return <Settings className="w-5 h-5" />;
        const IconComponent = typeConfig.icon;
        return <IconComponent className="w-5 h-5" />;
    };

    const getPriorityColor = (priority) => {
        const priorityConfig = priorityLevels.find(p => p.value === priority);
        return priorityConfig?.color || 'text-gray-600 bg-gray-100';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý quy tắc cảnh báo</h3>
                <button
                    onClick={handleCreateRule}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Tạo quy tắc mới
                </button>
            </div>

            {/* Create/Edit Form */}
            {(showCreateForm || editingRule) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                        {editingRule ? 'Chỉnh sửa quy tắc' : 'Tạo quy tắc mới'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên quy tắc</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="VD: Tỷ lệ điểm danh thấp"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại cảnh báo</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {ruleTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngưỡng</label>
                            <input
                                type="number"
                                value={formData.threshold}
                                onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="VD: 70"
                                step="0.1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {priorityLevels.map(priority => (
                                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Điều kiện</label>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {conditionTemplates[formData.type]?.map((template, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleConditionTemplateSelect(template.value)}
                                            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200"
                                        >
                                            {template.label}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={formData.condition}
                                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="VD: attendance_rate < 70"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại thông báo</label>
                            <div className="flex flex-wrap gap-3">
                                {notificationTypes.map(type => (
                                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.notification.includes(type.value)}
                                            onChange={() => handleNotificationChange(type.value)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <type.icon className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm text-gray-700">{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Mô tả chi tiết về quy tắc cảnh báo này..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={handleCancel}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Hủy
                        </button>
                        <button
                            onClick={handleSaveRule}
                            disabled={!formData.name || !formData.condition}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Lưu quy tắc
                        </button>
                    </div>
                </div>
            )}

            {/* Rules List */}
            <div className="space-y-3">
                {rules.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có quy tắc cảnh báo nào</p>
                        <p className="text-sm text-gray-400">Tạo quy tắc đầu tiên để bắt đầu nhận cảnh báo tự động</p>
                    </div>
                ) : rules.map((rule) => (
                    <div
                        key={rule.id}
                        className={`p-4 rounded-lg border transition-all ${
                            rule.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-75'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                                {getRuleTypeIcon(rule.type)}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                                            {priorityLevels.find(p => p.value === rule.priority)?.label}
                                        </span>
                                        {!rule.enabled && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                Tắt
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 text-sm mb-2">{rule.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>Điều kiện: {rule.condition}</span>
                                        <span>Ngưỡng: {rule.threshold}</span>
                                        <div className="flex items-center gap-1">
                                            <span>Thông báo:</span>
                                            {rule.notification.map(notif => {
                                                const notifConfig = notificationTypes.find(n => n.value === notif);
                                                return notifConfig ? (
                                                    <notifConfig.icon key={notif} className="w-3 h-3" />
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggleRule(rule.id)}
                                    className={`flex items-center ${rule.enabled ? 'text-green-600' : 'text-gray-400'}`}
                                    title={rule.enabled ? 'Tắt quy tắc' : 'Bật quy tắc'}
                                >
                                    {rule.enabled ? (
                                        <ToggleRight className="w-6 h-6" />
                                    ) : (
                                        <ToggleLeft className="w-6 h-6" />
                                    )}
                                </button>
                                <button
                                    onClick={() => handleEditRule(rule)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Chỉnh sửa"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteRule(rule.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Xóa"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Rules Summary */}
            {rules.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Settings className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-blue-900">Tóm tắt quy tắc</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                            <div className="font-medium text-blue-900">{rules.length}</div>
                            <div className="text-blue-700">Tổng quy tắc</div>
                        </div>
                        <div className="text-center">
                            <div className="font-medium text-green-900">{rules.filter(r => r.enabled).length}</div>
                            <div className="text-green-700">Đang hoạt động</div>
                        </div>
                        <div className="text-center">
                            <div className="font-medium text-red-900">{rules.filter(r => r.priority === 'high').length}</div>
                            <div className="text-red-700">Mức độ cao</div>
                        </div>
                        <div className="text-center">
                            <div className="font-medium text-blue-900">{rules.filter(r => r.type === 'attendance').length}</div>
                            <div className="text-blue-700">Điểm danh</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertRulesManager;