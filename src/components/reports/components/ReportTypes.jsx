import { Users, BarChart3, Award, TrendingUp } from 'lucide-react';

const ReportTypes = ({ filters, setFilters }) => {
    const reportTypes = [
        {
            value: 'attendance',
            label: 'Báo cáo điểm danh',
            icon: Users,
            description: 'Thống kê điểm danh theo thời gian và lớp học',
            color: 'blue'
        },
        {
            value: 'grade-distribution',
            label: 'Phân bố điểm số',
            icon: BarChart3,
            description: 'Phân tích điểm số và thành tích học tập',
            color: 'green'
        },
        {
            value: 'student-ranking',
            label: 'Xếp hạng thiếu nhi',
            icon: Award,
            description: 'Ranking thiếu nhi theo điểm tổng kết',
            color: 'yellow'
        },
        {
            value: 'overview',
            label: 'Báo cáo tổng quan',
            icon: TrendingUp,
            description: 'Tổng quan hoạt động và thống kê chung',
            color: 'purple'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
            green: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100',
            yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100',
            purple: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportTypes.map((type) => (
                <div
                    key={type.value}
                    className={`rounded-lg p-6 shadow-sm border transition-all cursor-pointer ${
                        filters.reportType === type.value
                            ? getColorClasses(type.color)
                            : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                    }`}
                    onClick={() => setFilters(prev => ({ ...prev, reportType: type.value }))}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <type.icon className={`w-8 h-8 ${
                            filters.reportType === type.value
                                ? `text-${type.color}-600`
                                : 'text-gray-600'
                        }`} />
                        <h3 className="font-medium text-gray-900">{type.label}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        {type.description}
                    </p>
                    <div className={`text-sm font-medium ${
                        filters.reportType === type.value
                            ? `text-${type.color}-700`
                            : 'text-blue-600'
                    }`}>
                        {filters.reportType === type.value ? '✓ Đang chọn' : 'Chọn loại này →'}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReportTypes;