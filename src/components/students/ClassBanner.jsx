import { GraduationCap, ArrowLeft } from "lucide-react";

const ClassBanner = ({ selectedClass, currentUser, onClearClassFilter }) => {
  if (!selectedClass && !(currentUser?.role === "giao_ly_vien" && !currentUser.assignedClass)) return null;

  // Nếu GLV chưa có lớp
  if (currentUser?.role === "giao_ly_vien" && !currentUser.assignedClass) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800">Chưa được phân công lớp</h3>
            <p className="text-yellow-700 text-sm">
              Vui lòng liên hệ Ban Điều Hành để được phân công lớp học
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Nếu có lớp đang xem
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <div>
            <span className="text-sm text-blue-600">Đang xem lớp:</span>
            <span className="ml-2 text-lg font-semibold text-blue-800">{selectedClass.name}</span>
            <span className="ml-2 text-sm text-blue-600">
              ({selectedClass.department?.displayName})
            </span>
          </div>
        </div>
        {currentUser?.role !== "giao_ly_vien" && (
          <button
            onClick={onClearClassFilter}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Xem tất cả lớp
          </button>
        )}
      </div>
    </div>
  );
};

export default ClassBanner;