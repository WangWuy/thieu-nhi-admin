import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { studentService } from "../../services/studentService";
import { classService } from "../../services/classService";
import { authService } from "../../services/authService";
import ExcelImportModal from "../../components/import/ExcelImportModal";

import ClassBanner from "../../components/students/ClassBanner";
import FiltersBar from "../../components/students/FiltersBar";
import StudentTable from "../../components/students/StudentTable";
import Pagination from "../../components/students/Pagination";
import EmptyState from "../../components/students/EmptyState";

const STUDENT_LIST_CACHE_KEY = "student-list-cache";

const StudentListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    classFilter: searchParams.get("classId") || "",
    isActiveFilter: "",
    page: 1,
    limit: 45,
  });

  const [pagination, setPagination] = useState({});
  const [showImportModal, setShowImportModal] = useState(false);

  const [editingScores, setEditingScores] = useState({});
  const [savingScores, setSavingScores] = useState({});
  const [searchInput, setSearchInput] = useState("");

  const [userLoaded, setUserLoaded] = useState(false);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const skipNextFetchRef = useRef(false);
  const fromClassList = Boolean(location.state?.fromClassList);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        let user = authService.getCurrentUserSync();
        if (user) {
          setCurrentUser(user);
          setUserLoaded(true);
        }

        if (!user) {
          user = await authService.getCurrentUser();
          if (user) setCurrentUser(user);
        }
        setUserLoaded(true);
      } catch (error) {
        console.error("Load user error:", error);
        setUserLoaded(true);
      }
    };
    loadUser();
  }, []);

  // Load classes after user is loaded
  useEffect(() => {
    if (!userLoaded || !currentUser || classesLoaded) return;

    const loadClasses = async () => {
      try {
        if (currentUser.role === "giao_ly_vien") {
          if (currentUser.assignedClass) {
            setClasses([currentUser.assignedClass]);
            setFilters((prev) => ({
              ...prev,
              classFilter: currentUser.assignedClass.id.toString(),
            }));
          } else {
            setClasses([]);
          }
        } else {
          const data = await classService.getClasses();
          setClasses(data);
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        setClasses([]);
      } finally {
        setClassesLoaded(true);
      }
    };

    loadClasses();
  }, [userLoaded, currentUser, classesLoaded]);

  // Sync search input
  useEffect(() => setSearchInput(filters.search), [filters.search]);

  // Restore cached list (keep data when navigating back)
  useEffect(() => {
    if (typeof window === "undefined" || !currentUser) return;

    try {
      const cachedRaw = sessionStorage.getItem(STUDENT_LIST_CACHE_KEY);
      if (!cachedRaw) return;

      const cached = JSON.parse(cachedRaw);
      const cachedUserId = cached?.userId;
      const currentUserId = currentUser.id || currentUser._id;
      if (cachedUserId && currentUserId && cachedUserId !== currentUserId) return;

      const classIdFromUrl = searchParams.get("classId");
      const cachedClassId = cached?.filters?.classFilter ? String(cached.filters.classFilter) : "";
      const cacheMatchesUrl = !classIdFromUrl || cachedClassId === classIdFromUrl;

      if (cached.filters) {
        setFilters((prev) => ({
          ...prev,
          ...cached.filters,
          classFilter: classIdFromUrl || cachedClassId || prev.classFilter,
        }));
        // Only rewrite URL if there's no classId in the URL already
        if (!classIdFromUrl && cachedClassId) {
          setSearchParams({ classId: cachedClassId });
        }
      }

      if (cacheMatchesUrl) {
        if (Array.isArray(cached.students)) setStudents(cached.students);
        if (cached.pagination) setPagination(cached.pagination);
        if (typeof cached.searchInput === "string") setSearchInput(cached.searchInput);
        skipNextFetchRef.current = true; // Skip refetch only when cache matches the target class
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to restore student list cache:", err);
    }
  }, [currentUser, setSearchParams, searchParams]);

  // Update URL params when class changes
  useEffect(() => {
    const classIdFromUrl = searchParams.get("classId");
    if (classIdFromUrl && classIdFromUrl !== filters.classFilter) {
      setFilters((prev) => ({ ...prev, classFilter: classIdFromUrl }));
    }
  }, [searchParams]);

  // Fetch students
  useEffect(() => {
    if (userLoaded && classesLoaded && currentUser) {
      if (skipNextFetchRef.current) {
        skipNextFetchRef.current = false;
        return;
      }
      fetchStudents();
    }
  }, [filters, userLoaded, classesLoaded, currentUser]);

  // Update selected class
  useEffect(() => {
    if (filters.classFilter && classes.length > 0) {
      const foundClass = classes.find(
        (cls) => cls.id === parseInt(filters.classFilter)
      );
      setSelectedClass(foundClass);
    } else {
      setSelectedClass(null);
    }
  }, [filters.classFilter, classes]);

  const fetchStudents = async () => {
    if (!userLoaded || !classesLoaded || !currentUser) return;
    try {
      setLoading(true);
      const queryParams = { ...filters };
      if (filters.isActiveFilter !== "")
        queryParams.isActive = filters.isActiveFilter;
      delete queryParams.isActiveFilter;

      const response = await studentService.getStudents(queryParams);
      let filtered = response.students;

      if (
        currentUser.role === "giao_ly_vien" &&
        currentUser.assignedClass
      ) {
        filtered = filtered.filter(
          (s) => s.classId === currentUser.assignedClass.id
        );
      }

      setStudents(filtered);
      setPagination(response.pagination);
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==== Handlers ====

  const handleSearchInputChange = (e) => setSearchInput(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      search: searchInput.trim(),
      page: 1,
    }));
  };

  const handleClassFilterChange = (classId) => {
    setFilters((prev) => ({ ...prev, classFilter: classId, page: 1 }));
    if (classId) setSearchParams({ classId });
    else setSearchParams({});
  };

  const clearClassFilter = () => handleClassFilterChange("");

  const handlePageChange = (newPage) =>
    setFilters((prev) => ({ ...prev, page: newPage }));

  const handleDeleteStudent = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa thiếu nhi này?")) return;
    await studentService.deleteStudent(id);
    fetchStudents();
  };

  const handleRestoreStudent = async (id) => {
    if (!confirm("Bạn có chắc muốn khôi phục thiếu nhi này?")) return;
    await studentService.restoreStudent(id);
    fetchStudents();
  };

  const handleViewAttendance = (student) => {
    navigate(`/students/${student.id}/attendance`);
  };

  // ==== Score Editing ====

  const startEditingScores = (id, scores) => {
    setEditingScores((prev) => ({
      ...prev,
      [id]: {
        study45Hk1: scores.study45Hk1 || 0,
        examHk1: scores.examHk1 || 0,
        study45Hk2: scores.study45Hk2 || 0,
        examHk2: scores.examHk2 || 0,
      },
    }));
  };

  const cancelEditingScores = (id) => {
    setEditingScores((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const updateScoreValue = (id, field, value) => {
    setEditingScores((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveScores = async (id) => {
    try {
      setSavingScores((prev) => ({ ...prev, [id]: true }));
      const scoreData = editingScores[id];
      await studentService.updateStudentScores(id, scoreData);
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...scoreData } : s))
      );
      cancelEditingScores(id);
      fetchStudents();
    } catch (err) {
      alert("Lỗi khi lưu điểm: " + err.message);
    } finally {
      setSavingScores((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Cache list state so going back keeps the previous data set
  useEffect(() => {
    if (typeof window === "undefined" || !currentUser) return;
    try {
      const payload = {
        userId: currentUser.id || currentUser._id || null,
        filters,
        pagination,
        students,
        searchInput,
      };
      sessionStorage.setItem(STUDENT_LIST_CACHE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to cache student list state:", err);
    }
  }, [students, filters, pagination, searchInput, currentUser]);

  if (loading && !currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ==== Render ====
  return (
    <div className="space-y-6">
      {fromClassList && (
        <button
          type="button"
          onClick={() => navigate("/classes")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách lớp
        </button>
      )}

      <ClassBanner
        selectedClass={selectedClass}
        currentUser={currentUser}
        onClearClassFilter={clearClassFilter}
      />

      <FiltersBar
        filters={filters}
        classes={classes}
        currentUser={currentUser}
        searchInput={searchInput}
        onSearchChange={handleSearchInputChange}
        onSearchSubmit={handleSearchSubmit}
        onClassFilterChange={handleClassFilterChange}
        onActiveFilterChange={(val) =>
          setFilters((prev) => ({ ...prev, isActiveFilter: val, page: 1 }))
        }
        onCreateClick={() =>
          navigate("/students/new", {
            state: { defaultClassId: filters.classFilter },
          })
        }
        onImportClick={() => setShowImportModal(true)}
      />

      <StudentTable
        students={students}
        editingScores={editingScores}
        savingScores={savingScores}
        startEditingScores={startEditingScores}
        cancelEditingScores={cancelEditingScores}
        updateScoreValue={updateScoreValue}
        saveScores={saveScores}
        onEditStudent={(student) =>
          navigate(`/students/${student.id}/edit`)
        }
        onDeleteStudent={handleDeleteStudent}
        onRestoreStudent={handleRestoreStudent}
        onViewAttendance={handleViewAttendance}
        currentUser={currentUser}
      />

      <Pagination pagination={pagination} onPageChange={handlePageChange} />

      {students.length === 0 && !loading && (
        <EmptyState
          currentUser={currentUser}
          filters={filters}
          selectedClass={selectedClass}
          searchInput={searchInput}
        />
      )}

      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={fetchStudents}
      />
    </div>
  );
};

export default StudentListPage;
