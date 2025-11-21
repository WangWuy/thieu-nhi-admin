import { FileText } from "lucide-react";
import FieldError from "./FieldError";

const StudentNotesSection = ({ note, onChange, error }) => {
    return (
        <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-600" />
                Ghi chú
            </h3>
            <div>
                <label className="block text-sm font-medium mb-1">
                    Ghi chú về thiếu nhi
                </label>
                <textarea
                    value={note}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    rows={3}
                    placeholder="VD: Thiếu nhi có tập trung tốt, rất hăng hái trong việc học..."
                />
                <FieldError error={error} />
            </div>
        </div>
    );
};

export default StudentNotesSection;
