import { useCallback, useEffect, useState } from "react";
import {
  Image as ImageIcon,
  UploadCloud,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";

const roleLabels = {
  ban_dieu_hanh: "Ban Điều Hành",
  phan_doan_truong: "Phân Đoàn Trưởng",
  giao_ly_vien: "Giáo Lý Viên",
};

const ProfileSettingsSection = ({ user }) => {
  const [profile, setProfile] = useState({
    saintName: user?.saintName || "",
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ success: "", error: "" });

  const resetAvatarPreview = useCallback((nextValue = "") => {
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith("blob:") && typeof window !== "undefined") {
        window.URL.revokeObjectURL(prev);
      }
      return nextValue;
    });
  }, []);

  useEffect(() => {
    setProfile({
      saintName: user?.saintName || "",
      fullName: user?.fullName || "",
      phoneNumber: user?.phoneNumber || "",
      address: user?.address || "",
    });
    resetAvatarPreview(user?.avatarUrl || "");
    setAvatarFile(null);
    setStatus({ success: "", error: "" });
  }, [user, resetAvatarPreview]);

  useEffect(() => {
    return () => {
      if (
        avatarPreview &&
        avatarPreview.startsWith("blob:") &&
        typeof window !== "undefined"
      ) {
        window.URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleFieldChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (event.target.value) {
      event.target.value = "";
    }
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({ success: "", error: "Vui lòng chọn tệp ảnh hợp lệ." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus({ success: "", error: "Kích thước ảnh tối đa là 5MB." });
      return;
    }

    setAvatarFile(file);
    if (typeof window !== "undefined") {
      resetAvatarPreview(window.URL.createObjectURL(file));
    } else {
      resetAvatarPreview("");
    }
    setStatus({ success: "", error: "" });
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    resetAvatarPreview(user?.avatarUrl || "");
    setStatus((prev) => ({ ...prev, error: "" }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      setStatus({ success: "", error: "Không tìm thấy người dùng để cập nhật." });
      return;
    }

    setSaving(true);
    setStatus({ success: "", error: "" });

    try {
      const payload = {
        saintName: profile.saintName,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        address: profile.address,
      };

      const updatedProfile = await userService.updateUser(user.id, payload);
      let nextAvatarUrl = updatedProfile.avatarUrl || user?.avatarUrl || "";

      if (avatarFile) {
        const uploadResult = await userService.uploadUserAvatar(
          user.id,
          avatarFile
        );
        nextAvatarUrl = uploadResult.avatarUrl || nextAvatarUrl;
      }

      const mergedUser = { ...user, ...updatedProfile, avatarUrl: nextAvatarUrl };
      authService.updateStoredUser(mergedUser);

      setProfile((prev) => ({
        ...prev,
        saintName:
          updatedProfile.saintName !== undefined
            ? updatedProfile.saintName
            : prev.saintName,
        fullName:
          updatedProfile.fullName !== undefined
            ? updatedProfile.fullName
            : prev.fullName,
        phoneNumber:
          updatedProfile.phoneNumber !== undefined
            ? updatedProfile.phoneNumber
            : prev.phoneNumber,
        address:
          updatedProfile.address !== undefined
            ? updatedProfile.address
            : prev.address,
      }));

      resetAvatarPreview(nextAvatarUrl);
      setAvatarFile(null);
      setStatus({ success: "Đã lưu thông tin cá nhân!", error: "" });
    } catch (error) {
      setStatus({
        success: "",
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật thông tin.",
      });
    } finally {
      setSaving(false);
    }
  };

  const roleLabel =
    roleLabels[user?.role] ||
    (user?.role ? user.role.replace(/_/g, " ") : "Không xác định");

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-red-800">
            Ảnh đại diện của bạn
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-28 h-28 rounded-full border border-dashed border-red-200 flex items-center justify-center overflow-hidden bg-red-50">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-10 h-10 text-red-200" />
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
                  onChange={handleAvatarChange}
                />
              </label>
              {avatarFile && (
                <p className="text-xs text-gray-500">Đã chọn: {avatarFile.name}</p>
              )}
              {(avatarFile || avatarPreview) && (
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-gray-700 underline text-left"
                  onClick={handleRemoveAvatar}
                >
                  Xóa ảnh hiện tại
                </button>
              )}
              <p className="text-xs text-gray-500">
                Hỗ trợ JPG, PNG. Dung lượng tối đa 5MB.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-red-700 mb-2">
            Vai trò
          </label>
          <input
            type="text"
            value={roleLabel}
            disabled
            className="w-full px-3 py-2 border border-red-200 rounded-lg bg-red-50 text-red-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-red-700 mb-2">
            Tên Thánh
          </label>
          <input
            type="text"
            value={profile.saintName}
            onChange={(e) => handleFieldChange("saintName", e.target.value)}
            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-red-700 mb-2">
            Họ và tên
          </label>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => handleFieldChange("fullName", e.target.value)}
            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-red-700 mb-2">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={profile.phoneNumber}
            onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-red-700 mb-2">
            Địa chỉ
          </label>
          <textarea
            value={profile.address}
            onChange={(e) => handleFieldChange("address", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {status.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {status.error}
        </div>
      )}

      {status.success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          {status.success}
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default ProfileSettingsSection;
