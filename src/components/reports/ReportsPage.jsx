import { useState } from 'react';
import {
    FileText,
    Download,
    Calendar,
    Users,
    BarChart3,
    TrendingUp,
    Filter,
    RefreshCw
} from 'lucide-react';

const ReportsPage = () => {
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reportType: 'attendance'
    });

    const reportTypes = [
        { value: 'attendance', label: 'Báo cáo điểm danh', icon: Users },
        { value: 'students', label: 'Báo cáo thiếu nhi', icon: Users },
        { value: 'performance', label: 'Báo cáo thành tích', icon: TrendingUp },
        { value: 'overview', label: 'Báo cáo tổng quan', icon: BarChart3 }
    ];

    const handleGenerateReport = async () => {
        setLoading(true);
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        alert('Báo cáo đã được tạo thành công!');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                {/* <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1> */}
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Tạo và xuất báo cáo</span>
                </div>
            </div>

            {/* Report Generation */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Tạo báo cáo mới</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại báo cáo
                        </label>
                        <select
                            value={filters.reportType}
                            onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {reportTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                    {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {loading ? 'Đang tạo báo cáo...' : 'Tạo báo cáo'}
                </button>
            </div>

            {/* Report Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {reportTypes.map((type) => (
                    <div key={type.value} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <type.icon className="w-8 h-8 text-blue-600" />
                            <h3 className="font-medium text-gray-900">{type.label}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            {type.value === 'attendance' && 'Thống kê điểm danh theo thời gian và lớp học'}
                            {type.value === 'students' && 'Danh sách và thông tin chi tiết thiếu nhi'}
                            {type.value === 'performance' && 'Điểm số và thành tích học tập'}
                            {type.value === 'overview' && 'Tổng quan hoạt động thiếu nhi'}
                        </p>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, reportType: type.value }))}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Chọn loại này →
                        </button>
                    </div>
                ))}
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Báo cáo gần đây</h2>
                <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p>Chưa có báo cáo nào được tạo</p>
                    <p className="text-sm">Tạo báo cáo đầu tiên bằng cách sử dụng form ở trên</p>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;