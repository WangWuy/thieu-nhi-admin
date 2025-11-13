import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  Image as ImageIcon,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { userService } from "../../services/userService";
import { departmentService } from "../../services/departmentService";
import { classService } from "../../services/classService";
import { USER_ROLES } from "../../utils/constants";

const createEmptyForm = () => ({
  username: "",
  password: "",
  role: "",
  saintName: "",
  fullName: "",
  birthDate: "",
  phoneNumber: "",
  address: "",
  departmentId: "",
});

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(() => createEmptyForm());
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [classesLoading, setClassesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [serverAvatarUrl, setServerAvatarUrl] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [initialAssignedClassIds, setInitialAssignedClassIds] = useState([]);
  const location = useLocation();
  const routedUser = location.state?.user;

  const resetAvatarPreview = useCallback((nextValue = "") => {
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith("blob:") && typeof window !== "undefined") {
        window.URL.revokeObjectURL(prev);
      }
      return nextValue;
    });
  }, []);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await departmentService.getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };

    loadDepartments();
  }, []);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setClassesLoading(true);
        const data = await classService.getClasses();
        setClasses(data);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      } finally {
        setClassesLoading(false);
      }
    };

    loadClasses();
  }, []);

  const populateUserData = useCallback(
    (data) => {
      const resolvedDepartmentId =
        data.departmentId ||
        data.department?.id ||
        data.department?.departmentId ||
        "";

      setFormData({
        username: data.username || "",
        password: "",
        role: data.role || "",
        saintName: data.saintName || "",
        fullName: data.fullName || "",
        birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
        departmentId: resolvedDepartmentId ? String(resolvedDepartmentId) : "",
      });
      const avatarUrl = data.avatarUrl || "";
      setServerAvatarUrl(avatarUrl);
      resetAvatarPreview(avatarUrl);
      const assignedClassIds = data.classTeachers?.map((ct) => ct.classId) || [];
      setSelectedClassIds(assignedClassIds.map((clsId) => String(clsId)));
      setInitialAssignedClassIds(assignedClassIds);
    },
    [resetAvatarPreview]
  );

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      setFormData(createEmptyForm());
      setServerAvatarUrl("");
      resetAvatarPreview("");
      setSelectedClassIds([]);
      setInitialAssignedClassIds([]);
      return;
    }

    if (routedUser && String(routedUser.id) === id) {
      populateUserData(routedUser);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const loadUser = async () => {
      setLoading(true);
      try {
        const data = await userService.getUserById(id);
        if (!isMounted) return;
        populateUserData(data);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch user:", error);
        setErrors((prev) => ({
          ...prev,
          submit: error.message || "Không thể tải thông tin người dùng.",
        }));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();
    return () => {
      isMounted = false;
    };
  }, [id, isEditMode, populateUserData, resetAvatarPreview, routedUser]);

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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "role" && value !== USER_ROLES.GIAO_LY_VIEN) {
      setSelectedClassIds([]);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (event.target.value) {
      event.target.value = "";
    }
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Vui lòng chọn tệp ảnh hợp lệ.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Kích thước ảnh tối đa là 5MB.",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, avatar: "" }));
    setAvatarFile(file);
    if (typeof window !== "undefined") {
      resetAvatarPreview(window.URL.createObjectURL(file));
    } else {
      resetAvatarPreview("");
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    resetAvatarPreview(serverAvatarUrl || "");
    setErrors((prev) => ({ ...prev, avatar: "" }));
  };

  const toggleClassSelection = (classId) => {
    const idStr = String(classId);
    setSelectedClassIds((prev) =>
      prev.includes(idStr)
        ? prev.filter((id) => id !== idStr)
        : [...prev, idStr]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Tên đăng nhập là bắt buộc";
    if (!formData.fullName) newErrors.fullName = "Họ và tên là bắt buộc";
    if (!formData.role) newErrors.role = "Vui lòng chọn vai trò";
    if (
      formData.role === USER_ROLES.PHAN_DOAN_TRUONG &&
      !formData.departmentId
    ) {
      newErrors.departmentId = "Vui lòng chọn ngành phụ trách";
    }
    if (!isEditMode && !formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const extractUserId = (data) => {
    if (!data) return null;
    if (typeof data === "number") return data;
    if (data.id) return data.id;
    if (data.user?.id) return data.user.id;
    return null;
  };

  const syncClassAssignments = async (userId, isGiaoLyVien) => {
    const numericUserId = Number(userId);
    if (!numericUserId) return;

    const selectedIdsNum = selectedClassIds
      .map((id) => parseInt(id, 10))
      .filter((id) => !Number.isNaN(id));
    const initialIdsNum = (initialAssignedClassIds || []).filter(
      (id) => !Number.isNaN(id)
    );
    const selectedSet = new Set(selectedIdsNum);
    const initialSet = new Set(initialIdsNum);

    if (!isGiaoLyVien) {
      if (initialIdsNum.length === 0) return;
      await Promise.all(
        initialIdsNum.map((classId) =>
          classService.removeTeacher(classId, numericUserId)
        )
      );
      return;
    }

    const toAdd = selectedIdsNum.filter((id) => !initialSet.has(id));
    const toRemove = initialIdsNum.filter((id) => !selectedSet.has(id));

    await Promise.all([
      ...toAdd.map((classId) =>
        classService.assignTeacher(classId, {
          userId: numericUserId,
          isPrimary: false,
        })
      ),
      ...toRemove.map((classId) =>
        classService.removeTeacher(classId, numericUserId)
      ),
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setErrors((prev) => ({ ...prev, submit: "" }));

    try {
      const submitData = { ...formData };

      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "") {
          submitData[key] = null;
        }
      });

      if (submitData.departmentId) {
        submitData.departmentId = parseInt(submitData.departmentId, 10);
      }

      if (isEditMode && !submitData.password) {
        delete submitData.password;
      }

      let response;
      if (isEditMode) {
        response = await userService.updateUser(id, submitData);
      } else {
        response = await userService.createUser(submitData);
      }

      const resolvedUserId = isEditMode
        ? Number(id)
        : extractUserId(response);

      if (!resolvedUserId) {
        throw new Error("Không thể xác định ID người dùng sau khi lưu.");
      }

      if (avatarFile) {
        await userService.uploadUserAvatar(resolvedUserId, avatarFile);
      }

      await syncClassAssignments(
        resolvedUserId,
        formData.role === USER_ROLES.GIAO_LY_VIEN
      );

      navigate("/users", { replace: true });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || error.message,
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/users");
  };

  const currentAvatarPreview = avatarPreview;
  const pageTitle = isEditMode ? "Chỉnh sửa người dùng" : "Thêm người dùng";
  const isGiaoLyVien = formData.role === USER_ROLES.GIAO_LY_VIEN;
  const isPhanDoanTruong = formData.role === USER_ROLES.PHAN_DOAN_TRUONG;

  const classesByDepartment = useMemo(() => {
    const groups = {};
    classes.forEach((cls) => {
      const deptName = cls.department?.displayName || "Chưa có ngành";
      if (!groups[deptName]) groups[deptName] = [];
      groups[deptName].push(cls);
    });
    return groups;
  }, [classes]);

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <p className="text-red-600 text-xs mt-1">{error}</p>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-500">
            {isEditMode
              ? "Cập nhật thông tin người dùng hệ thống"
              : "Tạo người dùng mới cho hệ thống"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Thông tin tài khoản
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleFieldChange("username", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="nguyenvana"
              />
              <ErrorMessage error={errors.username} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isEditMode
                  ? "Mật khẩu mới (để trống nếu không đổi)"
                  : "Mật khẩu *"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleFieldChange("password", e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="******"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <ErrorMessage error={errors.password} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleFieldChange("role", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Chọn vai trò</option>
              <option value={USER_ROLES.BAN_DIEU_HANH}>Ban Điều Hành</option>
              <option value={USER_ROLES.PHAN_DOAN_TRUONG}>Phân Đoàn Trưởng</option>
              <option value={USER_ROLES.GIAO_LY_VIEN}>Giáo Lý Viên</option>
            </select>
            <ErrorMessage error={errors.role} />
          </div>

  {formData.role === USER_ROLES.PHAN_DOAN_TRUONG && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngành phụ trách *
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => handleFieldChange("departmentId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn ngành</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.displayName}
                  </option>
                ))}
              </select>
              <ErrorMessage error={errors.departmentId} />
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Ảnh đại diện
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-28 h-28 rounded-full border border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-white">
                {currentAvatarPreview ? (
                  <img
                    src={currentAvatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                )}
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100">
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
                {(avatarFile || currentAvatarPreview) && (
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
                <ErrorMessage error={errors.avatar} />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Phân công & phụ trách
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngành phụ trách{isPhanDoanTruong && " *"}
              </label>
              <select
                value={formData.departmentId || ""}
                onChange={(e) =>
                  handleFieldChange("departmentId", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn ngành</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.displayName}
                  </option>
                ))}
              </select>
              <ErrorMessage error={errors.departmentId} />
            </div>

            {isGiaoLyVien && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lớp phụ trách
                </label>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-3 bg-white">
                  {classesLoading ? (
                    <div className="text-sm text-gray-500">Đang tải danh sách lớp...</div>
                  ) : classes.length === 0 ? (
                    <div className="text-sm text-gray-500">Chưa có lớp nào.</div>
                  ) : (
                    Object.entries(classesByDepartment).map(
                      ([deptName, deptClasses]) => (
                        <div key={deptName}>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            {deptName}
                          </p>
                          <div className="space-y-2">
                            {deptClasses.map((cls) => (
                              <label
                                key={cls.id}
                                className="flex items-center gap-2 text-sm text-gray-700"
                              >
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={selectedClassIds.includes(
                                    String(cls.id)
                                  )}
                                  onChange={() => toggleClassSelection(cls.id)}
                                />
                                <span>
                                  {cls.name}
                                  {cls.department?.displayName
                                    ? ` (${cls.department.displayName})`
                                    : ""}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Thánh
              </label>
              <input
                type="text"
                value={formData.saintName}
                onChange={(e) => handleFieldChange("saintName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Phanxicô, Maria..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleFieldChange("fullName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nguyễn Văn A"
              />
              <ErrorMessage error={errors.fullName} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày sinh
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleFieldChange("birthDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0901234567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleFieldChange("address", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Đường ABC, Phường XYZ..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? "Cập nhật" : "Tạo mới"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormPage;
