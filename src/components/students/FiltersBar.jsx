import { Search, Upload, Plus } from "lucide-react";

const FiltersBar = ({
  filters,
  classes,
  currentUser,
  searchInput,
  onSearchChange,
  onSearchSubmit,
  onClassFilterChange,
  onActiveFilterChange,
  onCreateClick,
  onImportClick,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <form onSubmit={onSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mã thiếu nhi..."
              value={searchInput}
              onChange={onSearchChange}
              className="w-full pl-11 pr-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </form>
        </div>

        {/* Class Filter */}
        <select
          value={filters.classFilter}
          onChange={(e) => onClassFilterChange(e.target.value)}
          className="px-3 py-2 border rounded-lg"
          disabled={currentUser?.role === "giao_ly_vien"}
        >
          <option value="">
            {currentUser?.role === "giao_ly_vien" && classes.length === 0
              ? "Chưa được phân công lớp"
              : "Tất cả lớp"}
          </option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>

        {/* Active Filter */}
        <select
          value={filters.isActiveFilter}
          onChange={(e) => onActiveFilterChange(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang học</option>
          <option value="false">Đã xóa</option>
        </select>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {(currentUser?.role !== "giao_ly_vien" || currentUser?.assignedClass) && (
            <>
              <button
                onClick={onImportClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={onCreateClick}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;