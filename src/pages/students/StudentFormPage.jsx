import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Award,
  Calculator,
  FileText,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";
import { classService } from "../../services/classService";
import { studentService } from "../../services/studentService";
import { authService } from "../../services/authService";

const StudentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);
  const defaultClassId = location.state?.defaultClassId || "";

  const normalizeClassId = (value) => (value ? String(value) : "");

  const createEmptyFormState = (classIdValue = "") => ({
    studentCode: "",
    saintName: "",
    fullName: "",
    birthDate: "",
    phoneNumber: "",
    parentPhone1: "",
    parentPhone2: "",
    address: "",
    note: "",
    classId: normalizeClassId(classIdValue),
    study45Hk1: 0,
    examHk1: 0,
    study45Hk2: 0,
    examHk2: 0,
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(isEditMode);
  const [pageError, setPageError] = useState("");
  const [formData, setFormData] = useState(() =>
    createEmptyFormState(defaultClassId)
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const resetAvatarPreview = useCallback((nextValue = "") => {
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith("blob:") && typeof window !== "undefined") {
        window.URL.revokeObjectURL(prev);
      }
      return nextValue;
    });
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        let user = authService.getCurrentUserSync();
        if (!user) {
          user = await authService.getCurrentUser();
        }
        setCurrentUser(user || null);
      } catch (error) {
        console.error("Load user error:", error);
      } finally {
        setUserLoaded(true);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!userLoaded) return;

    const loadClasses = async () => {
      setClassesLoading(true);
      try {
        if (currentUser?.role === "giao_ly_vien" && currentUser.assignedClass) {
          setClasses([currentUser.assignedClass]);
        } else {
          const data = await classService.getClasses();
          setClasses(data);
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        setPageError("Không thể tải danh sách lớp. Vui lòng thử lại sau.");
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };

    loadClasses();
  }, [userLoaded, currentUser]);

  useEffect(() => {
    const loadStudent = async () => {
      if (!isEditMode) {
        setStudent(null);
        setStudentLoading(false);
        return;
      }

      setStudentLoading(true);
      try {
        const data = await studentService.getStudentById(id);
        setStudent(data);
      } catch (error) {
        console.error("Failed to fetch student:", error);
        setPageError(error.message || "Không thể tải thông tin thiếu nhi.");
      } finally {
        setStudentLoading(false);
      }
    };

    loadStudent();
  }, [id, isEditMode]);

  useEffect(() => {
    if (student) {
      setFormData({
        studentCode: student.studentCode || "",
        saintName: student.saintName || "",
        fullName: student.fullName || "",
        birthDate: student.birthDate ? student.birthDate.split("T")[0] : "",
        phoneNumber: student.phoneNumber || "",
        parentPhone1: student.parentPhone1 || "",
        parentPhone2: student.parentPhone2 || "",
        address: student.address || "",
        note: student.note || "",
        classId: normalizeClassId(student.classId || defaultClassId),
        study45Hk1: student.study45Hk1 || 0,
        examHk1: student.examHk1 || 0,
        study45Hk2: student.study45Hk2 || 0,
        examHk2: student.examHk2 || 0,
      });
      resetAvatarPreview(student.avatarUrl || "");
    } else {
      setFormData(createEmptyFormState(defaultClassId));
      resetAvatarPreview("");
    }
    setErrors({});
    setAvatarFile(null);
  }, [student, defaultClassId, resetAvatarPreview]);

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

  const calculateStudyAverage = () => {
    const { study45Hk1, examHk1, study45Hk2, examHk2 } = formData;
    const total =
      parseFloat(study45Hk1) +
      parseFloat(study45Hk2) +
      parseFloat(examHk1) * 2 +
      parseFloat(examHk2) * 2;
    return (total / 6).toFixed(1);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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
    setErrors((prev) => ({ ...prev, avatar: "" }));
    resetAvatarPreview(student?.avatarUrl || "");
  };

  const handleCancel = () => {
    navigate("/students");
  };

  const extractStudentId = (data) => {
    if (!data) return null;
    if (typeof data === "number") return data;
    if (data.id) return data.id;
    if (data.student?.id) return data.student.id;
    if (data.data?.id) return data.data.id;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.studentCode)
      newErrors.studentCode = "Mã thiếu nhi là bắt buộc";
    if (!formData.fullName) newErrors.fullName = "Họ tên là bắt buộc";
    if (!formData.classId) newErrors.classId = "Lớp là bắt buộc";

    ["study45Hk1", "examHk1", "study45Hk2", "examHk2"].forEach((field) => {
      const value = parseFloat(formData[field]);
      if (value < 0 || value > 10) {
        newErrors[field] = "Điểm phải từ 0 đến 10";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setSaving(true);
    try {
      let savedStudent;
      if (isEditMode) {
        savedStudent = await studentService.updateStudent(
          Number(id),
          formData
        );
      } else {
        savedStudent = await studentService.createStudent(formData);
      }

      const studentIdForAvatar = isEditMode
        ? Number(id)
        : extractStudentId(savedStudent);

      if (avatarFile && studentIdForAvatar) {
        await studentService.uploadStudentAvatar(studentIdForAvatar, avatarFile);
      }

      navigate("/students", { replace: true });
    } catch (error) {
      if (error.response?.data?.details) {
        const serverErrors = {};
        error.response.data.details.forEach((detail) => {
          serverErrors[detail.path] = detail.msg;
        });
        setErrors(serverErrors);
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: error.response?.data?.message || error.message,
        }));
      }
    } finally {
      setSaving(false);
    }
  };

  const isLoading = classesLoading || studentLoading;
  const pageTitle = isEditMode ? "Chỉnh sửa thiếu nhi" : "Thêm thiếu nhi";

  const currentAvatarPreview = avatarPreview || student?.avatarUrl || "";

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <p className="text-red-600 text-xs mt-1">{error}</p>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/students")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-500">
            Sử dụng biểu mẫu dưới đây để {isEditMode ? "cập nhật" : "tạo mới"} thiếu nhi
          </p>
        </div>
      </div>

      {pageError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {pageError}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">{pageTitle}</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.submit}
              </div>
            )}

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
                      onChange={handleAvatarChange}
                    />
                  </label>
                  {avatarFile && (
                    <p className="text-xs text-gray-500">
                      Đã chọn: {avatarFile.name}
                    </p>
                  )}
                  {(avatarFile || student?.avatarUrl) && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
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
              <ErrorMessage error={errors.avatar} />
            </div>

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
                    onChange={(e) =>
                      handleInputChange("studentCode", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: TN0001"
                  />
                  <ErrorMessage error={errors.studentCode} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Lớp *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) =>
                      handleInputChange("classId", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn lớp</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.department?.displayName})
                      </option>
                    ))}
                  </select>
                  <ErrorMessage error={errors.classId} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tên thánh
                  </label>
                  <input
                    type="text"
                    value={formData.saintName}
                    onChange={(e) =>
                      handleInputChange("saintName", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Nguyễn Văn A"
                  />
                  <ErrorMessage error={errors.fullName} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0901234567"
                  />
                  <ErrorMessage error={errors.phoneNumber} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    SĐT phụ huynh 1
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone1}
                    onChange={(e) =>
                      handleInputChange("parentPhone1", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0901234567"
                  />
                  <ErrorMessage error={errors.parentPhone1} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    SĐT phụ huynh 2
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone2}
                    onChange={(e) =>
                      handleInputChange("parentPhone2", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0901234567"
                  />
                  <ErrorMessage error={errors.parentPhone2} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Địa chỉ
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                  />
                  <ErrorMessage error={errors.address} />
                </div>
              </div>
            </div>

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
                  value={formData.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={3}
                  placeholder="VD: Thiếu nhi có tập trung tốt, rất hăng hái trong việc học..."
                />
                <ErrorMessage error={errors.note} />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Điểm số giáo lý
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">Học kỳ 1</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Điểm 45 phút
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formData.study45Hk1}
                        onChange={(e) =>
                          handleInputChange("study45Hk1", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.0"
                      />
                      <ErrorMessage error={errors.study45Hk1} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Điểm thi (x2)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formData.examHk1}
                        onChange={(e) =>
                          handleInputChange("examHk1", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.0"
                      />
                      <ErrorMessage error={errors.examHk1} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">Học kỳ 2</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Điểm 45 phút
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formData.study45Hk2}
                        onChange={(e) =>
                          handleInputChange("study45Hk2", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.0"
                      />
                      <ErrorMessage error={errors.study45Hk2} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Điểm thi (x2)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formData.examHk2}
                        onChange={(e) =>
                          handleInputChange("examHk2", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.0"
                      />
                      <ErrorMessage error={errors.examHk2} />
                    </div>
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
                  {calculateStudyAverage()}
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
                    <li>
                      Điểm điểm danh: Từ việc điểm danh thứ 5 và Chúa nhật
                    </li>
                    <li>
                      Điểm tổng: Điểm giáo lý x 0.6 + Điểm điểm danh x 0.4
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    {isEditMode ? "Cập nhật" : "Thêm"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentFormPage;
