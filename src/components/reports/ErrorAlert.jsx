import { AlertCircle } from 'lucide-react';

const ErrorAlert = ({ error }) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
                <p className="text-red-800 font-medium">Lỗi tạo báo cáo</p>
                <p className="text-red-700 text-sm">{error}</p>
            </div>
        </div>
    );
};

export default ErrorAlert;