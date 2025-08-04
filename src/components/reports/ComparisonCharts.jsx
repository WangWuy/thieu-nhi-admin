import { RefreshCw, GitCompare } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const ComparisonCharts = ({ data, loading, activeChart, setActiveChart, chartTypes }) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

    const renderChart = () => {
        if (loading) {
            return (
                <div className="h-96 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            );
        }

        if (!data || data.length === 0) {
            return (
                <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                        <GitCompare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Chọn dữ liệu để so sánh</p>
                    </div>
                </div>
            );
        }

        switch (activeChart) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                                dataKey="name" 
                                className="text-sm"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis className="text-sm" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value, name) => {
                                    if (name === 'attendanceRate') return [`${value.toFixed(1)}%`, 'Tỷ lệ điểm danh'];
                                    if (name === 'studyScore') return [`${value.toFixed(1)}`, 'Điểm học tập'];
                                    if (name === 'overallScore') return [`${value.toFixed(1)}`, 'Điểm tổng'];
                                    return [value, name];
                                }}
                            />
                            <Legend />
                            <Bar 
                                dataKey="attendanceRate" 
                                name="Tỷ lệ điểm danh (%)" 
                                fill="#3B82F6" 
                                radius={[2, 2, 0, 0]} 
                            />
                            <Bar 
                                dataKey="studyScore" 
                                name="Điểm học tập" 
                                fill="#10B981" 
                                radius={[2, 2, 0, 0]} 
                            />
                            <Bar 
                                dataKey="overallScore" 
                                name="Điểm tổng" 
                                fill="#F59E0B" 
                                radius={[2, 2, 0, 0]} 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="name" className="text-sm" />
                            <YAxis className="text-sm" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                                formatter={(value, name) => {
                                    if (name === 'attendanceRate') return [`${value.toFixed(1)}%`, 'Tỷ lệ điểm danh'];
                                    if (name === 'overallScore') return [`${value.toFixed(1)}`, 'Điểm tổng'];
                                    return [value, name];
                                }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="attendanceRate" 
                                name="Tỷ lệ điểm danh (%)"
                                stroke="#3B82F6" 
                                strokeWidth={3}
                                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="overallScore" 
                                name="Điểm tổng"
                                stroke="#10B981" 
                                strokeWidth={3}
                                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'radar':
                const radarData = data.slice(0, 4).map(item => ({
                    subject: item.name,
                    'Điểm danh': item.attendanceRate || 0,
                    'Học tập': (item.studyScore || 0) * 10, // Scale to 0-100
                    'Tổng kết': (item.overallScore || 0) * 10,
                    'Hiệu quả': Math.min((item.efficiency || 10) * 5, 100) // Scale to 0-100
                }));

                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" className="text-sm" />
                            <PolarRadiusAxis domain={[0, 100]} className="text-xs" />
                            <Radar
                                name="Điểm danh"
                                dataKey="Điểm danh"
                                stroke="#3B82F6"
                                fill="#3B82F6"
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                            <Radar
                                name="Học tập"
                                dataKey="Học tập"
                                stroke="#10B981"
                                fill="#10B981"
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                            <Radar
                                name="Tổng kết"
                                dataKey="Tổng kết"
                                stroke="#F59E0B"
                                fill="#F59E0B"
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                            <Tooltip 
                                formatter={(value, name) => [`${value.toFixed(1)}`, name]}
                            />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                const pieData = data.map((item, index) => ({
                    name: item.name,
                    value: item.totalStudents || 0,
                    fill: colors[index % colors.length]
                }));

                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                dataKey="value"
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                label={({ name, value, percent }) => 
                                    value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(1)}%)` : ''
                                }
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value) => [`${value} thiếu nhi`, 'Số lượng']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    {chartTypes.map((chart) => (
                        <button
                            key={chart.id}
                            onClick={() => setActiveChart(chart.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                activeChart === chart.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <chart.icon className="w-4 h-4" />
                            {chart.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="p-6">
                {renderChart()}
            </div>

            {/* Chart Insights */}
            {data && data.length > 0 && !loading && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                            <div className="font-medium text-gray-900">
                                {Math.round(data.reduce((sum, item) => sum + (item.attendanceRate || 0), 0) / data.length)}%
                            </div>
                            <div className="text-gray-600">Tỷ lệ điểm danh TB</div>
                        </div>
                        <div className="text-center">
                            <div className="font-medium text-gray-900">
                                {(data.reduce((sum, item) => sum + (item.overallScore || 0), 0) / data.length).toFixed(1)}
                            </div>
                            <div className="text-gray-600">Điểm tổng TB</div>
                        </div>
                        <div className="text-center">
                            <div className="font-medium text-gray-900">
                                {data.reduce((sum, item) => sum + (item.totalStudents || 0), 0)}
                            </div>
                            <div className="text-gray-600">Tổng thiếu nhi</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparisonCharts;