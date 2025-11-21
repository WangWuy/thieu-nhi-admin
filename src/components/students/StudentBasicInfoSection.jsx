import { User } from "lucide-react";
import FieldError from "./FieldError";

const StudentBasicInfoSection = ({
    formData,
    classes,
    onChange,
    errors,
}) => {
    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Thông tin cơ bản
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Mã thiếu nhi *
                    </label>
                    <input
                        type="text"
                        value={formData.studentCode}
                        onChange={(e) => onChange("studentCode", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VD: TN0001"
                    />
                    <FieldError error={errors.studentCode} />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Lớp *
                    </label>
                    <select
                        value={formData.classId}
                        onChange={(e) => onChange("classId", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Chọn lớp</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name} ({cls.department?.displayName})
                            </option>
                        ))}
                    </select>
                    <FieldError error={errors.classId} />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Tên thánh
                    </label>
                    <input
                        type="text"
                        value={formData.saintName}
                        onChange={(e) => onChange("saintName", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VD: Maria"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Họ và tên *
                    </label>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => onChange("fullName", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VD: Nguyễn Văn A"
                    />
                    <FieldError error={errors.fullName} />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Ngày sinh
                    </label>
                    <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => onChange("birthDate", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        SĐT thiếu nhi
                    </label>
                    <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => onChange("phoneNumber", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0901234567"
                    />
                    <FieldError error={errors.phoneNumber} />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        SĐT phụ huynh 1
                    </label>
                    <input
                        type="tel"
                        value={formData.parentPhone1}
                        onChange={(e) => onChange("parentPhone1", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0901234567"
                    />
                    <FieldError error={errors.parentPhone1} />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        SĐT phụ huynh 2
                    </label>
                    <input
                        type="tel"
                        value={formData.parentPhone2}
                        onChange={(e) => onChange("parentPhone2", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0901234567"
                    />
                    <FieldError error={errors.parentPhone2} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                        Địa chỉ
                    </label>
                    <textarea
                        value={formData.address}
                        onChange={(e) => onChange("address", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                    />
                    <FieldError error={errors.address} />
                </div>
            </div>
        </div>
    );
};

export default StudentBasicInfoSection;
