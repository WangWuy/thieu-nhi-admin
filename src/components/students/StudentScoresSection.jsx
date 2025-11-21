import { Award, Calculator } from "lucide-react";
import FieldError from "./FieldError";

const ScoreInput = ({ label, value, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.0"
        />
        <FieldError error={error} />
    </div>
);

const StudentScoresSection = ({
    formData,
    errors,
    onChange,
    calculateAverage,
}) => {
    return (
        <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Điểm số giáo lý
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3">Học kỳ 1</h4>
                    <div className="space-y-3">
                        <ScoreInput
                            label="Điểm 45 phút"
                            value={formData.study45Hk1}
                            onChange={(value) => onChange("study45Hk1", value)}
                            error={errors.study45Hk1}
                        />
                        <ScoreInput
                            label="Điểm thi (x2)"
                            value={formData.examHk1}
                            onChange={(value) => onChange("examHk1", value)}
                            error={errors.examHk1}
                        />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3">Học kỳ 2</h4>
                    <div className="space-y-3">
                        <ScoreInput
                            label="Điểm 45 phút"
                            value={formData.study45Hk2}
                            onChange={(value) => onChange("study45Hk2", value)}
                            error={errors.study45Hk2}
                        />
                        <ScoreInput
                            label="Điểm thi (x2)"
                            value={formData.examHk2}
                            onChange={(value) => onChange("examHk2", value)}
                            error={errors.examHk2}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-blue-800">
                        Điểm trung bình (dự kiến)
                    </h4>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                    {calculateAverage()}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                    Công thức: (45' HK1 + 45' HK2 + Thi HK1x2 + Thi HK2x2) / 6
                </div>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> Điểm điểm danh và điểm tổng sẽ được
                    tính tự động dựa trên:
                    <ul className="list-disc list-inside mt-1 text-xs">
                        <li>Điểm điểm danh: Từ việc điểm danh thứ 5 và Chúa nhật</li>
                        <li>Điểm tổng: Điểm giáo lý x 0.6 + Điểm điểm danh x 0.4</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StudentScoresSection;
