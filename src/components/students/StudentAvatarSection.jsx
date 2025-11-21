import { Image as ImageIcon, UploadCloud } from "lucide-react";
import FieldError from "./FieldError";

const StudentAvatarSection = ({
    currentAvatarPreview,
    avatarFileName,
    onAvatarChange,
    onRemoveAvatar,
    showRemoveButton,
    error,
}) => {
    return (
        <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-red-500" />
                Ảnh đại diện
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-28 h-28 rounded-full border border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                    {currentAvatarPreview ? (
                        <img
                            src={currentAvatarPreview}
                            alt="Xem trước avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100">
                        <UploadCloud className="w-4 h-4" />
                        <span>Chọn ảnh</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onAvatarChange}
                        />
                    </label>
                    {avatarFileName && (
                        <p className="text-xs text-gray-500">Đã chọn: {avatarFileName}</p>
                    )}
                    {showRemoveButton && (
                        <button
                            type="button"
                            onClick={onRemoveAvatar}
                            className="text-xs text-gray-500 hover:text-gray-700 underline text-left"
                        >
                            Xóa ảnh đã chọn
                        </button>
                    )}
                    <p className="text-xs text-gray-500">
                        Hỗ trợ JPG, PNG, kích thước tối đa 5MB.
                    </p>
                </div>
            </div>
            <FieldError error={error} />
        </div>
    );
};

export default StudentAvatarSection;
