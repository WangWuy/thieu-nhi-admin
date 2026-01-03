import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { classService } from "../../services/classService";
import { studentService } from "../../services/studentService";
import { authService } from "../../services/authService";
import StudentAvatarSection from "../../components/students/StudentAvatarSection";
import StudentBasicInfoSection from "../../components/students/StudentBasicInfoSection";
import StudentNotesSection from "../../components/students/StudentNotesSection";
import StudentScoresSection from "../../components/students/StudentScoresSection";

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
  const [savingScores, setSavingScores] = useState(false);
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

  const handleUpdateScores = async () => {
    if (!isEditMode || !id) {
      alert("Chỉ có thể cập nhật điểm cho thiếu nhi đã tồn tại");
      return;
    }

    const newErrors = {};
    ["study45Hk1", "examHk1", "study45Hk2", "examHk2"].forEach((field) => {
      const value = parseFloat(formData[field]);
      if (isNaN(value) || value < 0 || value > 10) {
        newErrors[field] = "Điểm phải từ 0 đến 10";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setSavingScores(true);
    try {
      const scoreData = {
        study45Hk1: formData.study45Hk1,
        examHk1: formData.examHk1,
        study45Hk2: formData.study45Hk2,
        examHk2: formData.examHk2,
      };
      await studentService.updateStudentScores(Number(id), scoreData);
      alert("Cập nhật điểm thành công!");

      // Reload student data để lấy điểm trung bình mới
      const updatedStudent = await studentService.getStudentById(id);
      setStudent(updatedStudent);
    } catch (error) {
      if (error.response?.data?.details) {
        const serverErrors = {};
        error.response.data.details.forEach((detail) => {
          serverErrors[detail.path] = detail.msg;
        });
        setErrors((prev) => ({ ...prev, ...serverErrors }));
      } else {
        alert("Lỗi khi cập nhật điểm: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setSavingScores(false);
    }
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

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setSaving(true);
    try {
      let savedStudent;
      // Prepare data without scores for update/create
      const { study45Hk1, examHk1, study45Hk2, examHk2, ...basicData } = formData;

      if (isEditMode) {
        savedStudent = await studentService.updateStudent(
          Number(id),
          basicData
        );
      } else {
        // For new students, include default scores
        savedStudent = await studentService.createStudent({
          ...basicData,
          study45Hk1: 0,
          examHk1: 0,
          study45Hk2: 0,
          examHk2: 0,
        });
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
  const avatarFileName = avatarFile?.name || "";
  const showRemoveAvatarButton = Boolean(avatarFile || student?.avatarUrl);

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

            <StudentAvatarSection
              currentAvatarPreview={currentAvatarPreview}
              avatarFileName={avatarFileName}
              onAvatarChange={handleAvatarChange}
              onRemoveAvatar={handleRemoveAvatar}
              showRemoveButton={showRemoveAvatarButton}
              error={errors.avatar}
            />

            <StudentBasicInfoSection
              formData={formData}
              classes={classes}
              onChange={handleInputChange}
              errors={errors}
            />

            <StudentNotesSection
              note={formData.note}
              onChange={(value) => handleInputChange("note", value)}
              error={errors.note}
            />

            <StudentScoresSection
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              calculateAverage={calculateStudyAverage}
              onUpdateScores={handleUpdateScores}
              isEditMode={isEditMode}
              savingScores={savingScores}
            />

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
