import { useMemo, useState } from 'react';
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
import { alertService } from '../../services/alertService';

const AlertRulesManager = ({ rules, onRulesChange, onRefreshAlerts }) => {
    const [editingRule, setEditingRule] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [selectedConditionKeys, setSelectedConditionKeys] = useState([]);
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
            { key: 'attendance_rate', value: 'attendance_rate < {threshold}', label: 'Tỷ lệ điểm danh thấp hơn' },
            { key: 'consecutive_absent', value: 'consecutive_absent >= {threshold}', label: 'Vắng mặt liên tục từ' },
            { key: 'sunday_v_thursday', value: 'sunday_rate < thursday_rate - {threshold}', label: 'CN thấp hơn T5 từ' }
        ],
        grades: [
            { key: 'study_score', value: 'study_score < {threshold}', label: 'Điểm học tập thấp hơn' },
            { key: 'final_score', value: 'final_score < {threshold}', label: 'Điểm tổng thấp hơn' },
            { key: 'score_decline', value: 'score_decline >= {threshold}', label: 'Điểm giảm từ' },
            { key: 'student_study_score', value: 'student_study_score < {threshold}', label: 'Điểm học từng học sinh thấp' },
            { key: 'student_final_score', value: 'student_final_score < {threshold}', label: 'Điểm tổng từng học sinh thấp' }
        ],
        system: [
            { key: 'class_size', value: 'class_size < {threshold}', label: 'Sĩ số lớp ít hơn' },
            { key: 'teacher_ratio', value: 'teacher_ratio > {threshold}', label: 'Tỷ lệ GV/TN cao hơn' },
            { key: 'data_missing', value: 'data_missing >= {threshold}', label: 'Thiếu dữ liệu từ ngày' }
        ]
    };

    const currentTemplates = useMemo(() => conditionTemplates[formData.type] || [], [formData.type]);

    const buildConditionValue = (templateValue, threshold) =>
        templateValue.replace('{threshold}', threshold ?? 0);

    const buildConditionString = (keys, threshold, templates) => {
        if (!keys.length) return '';
        const parts = keys
            .map(key => templates.find(t => t.key === key))
            .filter(Boolean)
            .map(t => buildConditionValue(t.value, threshold));
        return parts.join(' AND ');
    };

    const handleCreateRule = () => {
        setError('');
        setShowCreateForm(true);
        const defaultTemplate = conditionTemplates.attendance[0];
        setFormData({
            name: '',
            type: 'attendance',
            condition: buildConditionValue(defaultTemplate.value, 0),
            threshold: 0,
            priority: 'medium',
            enabled: true,
            notification: ['system'],
            description: ''
        });
        setSelectedConditionKeys([defaultTemplate.key]);
    };

    const handleEditRule = (rule) => {
        setError('');
        const typeTemplates = conditionTemplates[rule.type] || [];
        const matchedKeys = typeTemplates
            .filter(t => rule.condition?.includes(t.key) || rule.condition === t.value || rule.condition?.includes(t.value))
            .map(t => t.key);
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
        setSelectedConditionKeys(matchedKeys.length ? matchedKeys : (typeTemplates[0] ? [typeTemplates[0].key] : []));
    };

    const handleSaveRule = async () => {
        try {
            setSaving(true);
            setError('');
            if (editingRule) {
                const updatedRule = await alertService.updateRule(editingRule, formData);
                const updatedRules = rules.map(rule =>
                    rule.id === editingRule ? updatedRule : rule
                );
                onRulesChange(updatedRules);
                setEditingRule(null);
            } else {
                const newRule = await alertService.createRule(formData);
                onRulesChange([...rules, newRule]);
                setShowCreateForm(false);
            }
            onRefreshAlerts();
        } catch (err) {
            setError(err.message || 'Không thể lưu quy tắc');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRule = async (ruleId) => {
        if (!confirm('Bạn có chắc muốn xóa quy tắc này?')) return;

        try {
            setSaving(true);
            setError('');
            await alertService.deleteRule(ruleId);
            const updatedRules = rules.filter(rule => rule.id !== ruleId);
            onRulesChange(updatedRules);
            onRefreshAlerts();
        } catch (err) {
            setError(err.message || 'Không thể xóa quy tắc');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleRule = async (ruleId) => {
        try {
            setSaving(true);
            setError('');
            const updatedRule = await alertService.toggleRule(ruleId);
            const updatedRules = rules.map(rule =>
                rule.id === ruleId ? updatedRule : rule
            );
            onRulesChange(updatedRules);
            onRefreshAlerts();
        } catch (err) {
            setError(err.message || 'Không thể cập nhật quy tắc');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingRule(null);
        setShowCreateForm(false);
        const defaultTemplate = conditionTemplates.attendance[0];
        setFormData({
            name: '',
            type: 'attendance',
            condition: buildConditionValue(defaultTemplate.value, 0),
            threshold: 0,
            priority: 'medium',
            enabled: true,
            notification: ['system'],
            description: ''
        });
        setSelectedConditionKeys([defaultTemplate.key]);
    };

    const handleNotificationChange = (notificationType) => {
        setFormData(prev => ({
            ...prev,
            notification: prev.notification.includes(notificationType)
                ? prev.notification.filter(n => n !== notificationType)
                : [...prev.notification, notificationType]
        }));
    };

    const handleConditionTemplateToggle = (templateKey) => {
        setSelectedConditionKeys(prev => {
            const nextKeys = prev.includes(templateKey)
                ? prev.filter(k => k !== templateKey)
                : [...prev, templateKey];
            setFormData(current => ({
                ...current,
                condition: buildConditionString(nextKeys, current.threshold, currentTemplates)
            }));
            return nextKeys;
        });
    };

    const handleTypeChange = (typeValue) => {
        setFormData(prev => {
            const templates = conditionTemplates[typeValue] || [];
            const nextTemplate = templates[0];
            return {
                ...prev,
                type: typeValue,
                condition: nextTemplate ? buildConditionValue(nextTemplate.value, prev.threshold) : ''
            };
        });
        const templates = conditionTemplates[typeValue] || [];
        setSelectedConditionKeys(templates[0] ? [templates[0].key] : []);
    };

    const handleThresholdChange = (value) => {
        const numeric = parseFloat(value);
        const cleanValue = Number.isNaN(numeric) ? 0 : numeric;
        setFormData(prev => ({
            ...prev,
            threshold: cleanValue,
            condition: buildConditionString(selectedConditionKeys, cleanValue, currentTemplates)
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:bg-gray-400"
                    disabled={saving}
                >
                    <Plus className="w-4 h-4" />
                    Tạo quy tắc mới
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

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
                            onChange={(e) => handleTypeChange(e.target.value)}
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
                                onChange={(e) => handleThresholdChange(e.target.value)}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {currentTemplates.map((template) => (
                                            <label
                                                key={template.key}
                                                className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:border-blue-300"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedConditionKeys.includes(template.key)}
                                                    onChange={() => handleConditionTemplateToggle(template.key)}
                                                    className="text-blue-600"
                                                />
                                                <span className="text-sm text-gray-700">{template.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Điều kiện đang áp dụng:
                                    </div>
                                    <div className="text-xs font-mono bg-gray-100 border rounded p-2 break-all">
                                        {formData.condition || 'Chưa chọn điều kiện'}
                                    </div>
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
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 disabled:bg-gray-200"
                            disabled={saving}
                        >
                            <X className="w-4 h-4" />
                            Hủy
                        </button>
                        <button
                            onClick={handleSaveRule}
                            disabled={!formData.name || !formData.condition || saving}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Đang lưu...' : 'Lưu quy tắc'}
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
                                className={`flex items-center ${rule.enabled ? 'text-green-600' : 'text-gray-400'} disabled:text-gray-300`}
                                disabled={saving}
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
                                className="text-blue-600 hover:text-blue-800 disabled:text-gray-300"
                                disabled={saving}
                                title="Chỉnh sửa"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="text-red-600 hover:text-red-800 disabled:text-gray-300"
                                disabled={saving}
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
