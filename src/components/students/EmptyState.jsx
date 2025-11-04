import { GraduationCap } from "lucide-react";

const EmptyState = ({ currentUser, filters, selectedClass, searchInput }) => {
  let message = "Không tìm thấy thiếu nhi nào";

  if (currentUser?.role === "giao_ly_vien" && !currentUser.assignedClass) {
    message = "Bạn chưa được phân công lớp nào";
  } else if (filters.isActiveFilter === "false") {
    message = "Hiện tại không có thiếu nhi nào đã nghỉ";
  } else if (searchInput?.length > 0) {
    message = "Không tìm thấy thiếu nhi nào khớp với tìm kiếm";
  } else if (selectedClass) {
    message = `Không có thiếu nhi nào trong lớp ${selectedClass.name}`;
  }

  return (
    <div className="text-center py-12">
      <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <div className="text-gray-500 mb-4">{message}</div>
    </div>
  );
};

export default EmptyState;