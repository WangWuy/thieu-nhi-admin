import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Key,
    ChevronLeft,
    ChevronRight,
    UserX,
    Upload
} from 'lucide-react';
import { userService } from '../../services/userService';
import { classService } from '../../services/classService';
import { departmentService } from '../../services/departmentService';
import { USER_ROLES } from '../../utils/constants';
import { getRoleName } from '../../utils/helpers';
import UserImportModal from '../../components/users/UserImportModal';
import { authService } from '../../services/authService';

const USER_LIST_CACHE_KEY = 'user-list-cache';

const UserListPage = () => {
    const navigate = useNavigate();
    const currentUserIdRef = useRef(authService.getCurrentUserSync()?.id || authService.getCurrentUserSync()?._id || null);
    const cacheRef = useRef(null);
    if (!cacheRef.current && typeof window !== 'undefined') {
        try {
            const cached = JSON.parse(sessionStorage.getItem(USER_LIST_CACHE_KEY));
            if (cached?.userId && currentUserIdRef.current && cached.userId !== currentUserIdRef.current) {
                cacheRef.current = null;
            } else {
                cacheRef.current = cached;
            }
        } catch (err) {
            console.error('Failed to parse user list cache:', err);
            cacheRef.current = null;
        }
    }

    const skipNextFetchRef = useRef(Boolean(cacheRef.current));
    const [shouldAutoFetch, setShouldAutoFetch] = useState(!cacheRef.current);
    const [users, setUsers] = useState(cacheRef.current?.users || []);
    const [loading, setLoading] = useState(!cacheRef.current);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: cacheRef.current?.filters?.search ?? '',
        roleFilter: cacheRef.current?.filters?.roleFilter ?? '',
        departmentFilter: cacheRef.current?.filters?.departmentFilter ?? '',
        classFilter: cacheRef.current?.filters?.classFilter ?? '',
        page: cacheRef.current?.filters?.page ?? 1,
        limit: cacheRef.current?.filters?.limit ?? 20
    });
    const [searchInput, setSearchInput] = useState(cacheRef.current?.searchInput ?? '');
    const [pagination, setPagination] = useState(cacheRef.current?.pagination || {});
    const [showImportModal, setShowImportModal] = useState(false);

    // New states for departments and classes
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);

    useEffect(() => {
        if (skipNextFetchRef.current) {
            skipNextFetchRef.current = false;
            return;
        }
        if (!shouldAutoFetch) return;
        fetchUsers();
    }, [filters, shouldAutoFetch]);

    useEffect(() => {
        setSearchInput(filters.search);
    }, [filters.search]);

    useEffect(() => {
        fetchDepartments();
        fetchClasses();
    }, []);

    // Filter classes when department filter changes
    useEffect(() => {
        if (filters.departmentFilter) {
            const filtered = classes.filter(cls =>
                cls.departmentId === parseInt(filters.departmentFilter)
            );
            setFilteredClasses(filtered);

            // Reset class filter if current selection doesn't belong to selected department
            if (filters.classFilter) {
                const isValidClass = filtered.some(cls => cls.id === parseInt(filters.classFilter));
                if (!isValidClass) {
                    setFilters(prev => ({ ...prev, classFilter: '', page: 1 }));
                }
            }
        } else {
            setFilteredClasses(classes);
        }
    }, [filters.departmentFilter, classes]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getUsers(filters);
            setUsers(response.users);
            setPagination(response.pagination);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const data = await departmentService.getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        }
    };

    const fetchClasses = async () => {
        try {
            const data = await classService.getClasses();
            setClasses(data);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
        }
    };

    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setFilters(prev => ({
            ...prev,
            search: searchInput.trim(),
            page: 1
        }));
        setShouldAutoFetch(true);
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit(e);
        }
    };

    const handleRoleFilter = (e) => {
        setFilters(prev => ({
            ...prev,
            roleFilter: e.target.value,
            page: 1
        }));
        setShouldAutoFetch(true);
    };

    const handleDepartmentFilter = (e) => {
        setFilters(prev => ({
            ...prev,
            departmentFilter: e.target.value,
            classFilter: '', // Reset class filter when department changes
            page: 1
        }));
        setShouldAutoFetch(true);
    };

    const handleClassFilter = (e) => {
        setFilters(prev => ({
            ...prev,
            classFilter: e.target.value,
            page: 1
        }));
        setShouldAutoFetch(true);
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        setShouldAutoFetch(true);
    };

    const handleResetPassword = async (userId) => {
        if (!confirm('Bạn có chắc muốn reset mật khẩu về "123456"?')) return;

        try {
            await userService.resetPassword(userId, '123456');
            alert('Reset mật khẩu thành công!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    const handleDeactivate = async (userId) => {
        if (!confirm('Bạn có chắc muốn khóa tài khoản này?')) return;

        try {
            await userService.deactivateUser(userId);
            fetchUsers();
            alert('Khóa tài khoản thành công!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    const handleImportSuccess = () => {
        fetchUsers();
        setShowImportModal(false);
    };

    // Persist list state for faster back navigation
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const payload = {
                userId: currentUserIdRef.current,
                filters,
                searchInput,
                users,
                pagination
            };
            sessionStorage.setItem(USER_LIST_CACHE_KEY, JSON.stringify(payload));
        } catch (err) {
            console.error('Failed to cache user list state:', err);
        }
    }, [filters, searchInput, users, pagination]);

    // Helper function to format class/department info
    const formatClassDepartmentInfo = (user) => {
        // Nếu user có classTeachers (GLV)
        if (user.classTeachers?.length > 0) {
            // Group classes by department
            const classByDept = {};
            user.classTeachers.forEach(ct => {
                const deptName = ct.class.department?.displayName || 'Chưa có ngành';
                if (!classByDept[deptName]) {
                    classByDept[deptName] = [];
                }
                classByDept[deptName].push(ct.class.name);
            });

            return (
                <div>
                    {Object.entries(classByDept).map(([deptName, classes], index) => (
                        <div key={index} className={index > 0 ? 'mt-2' : ''}>
                            <div className="font-semibold">{deptName}</div>
                            <div className="text-sm text-gray-600">{classes.join(', ')}</div>
                        </div>
                    ))}
                </div>
            );
        }

        // Nếu không có gì
        return (
            <div>
                <div className="text-gray-500 text-sm">Chưa có lớp</div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-red-100 rounded w-1/4 animate-pulse"></div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-red-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-gradient-to-r from-red-50 to-amber-50 p-4 rounded-lg shadow-sm border border-red-100">
                <div className="flex flex-col gap-4">
                    {/* Search row */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex-1">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên, username..."
                                    value={searchInput}
                                    onChange={handleSearchInputChange}
                                    onKeyPress={handleSearchKeyPress}
                                    className="w-full pl-11 pr-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 search-input"
                                />
                            </form>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Import Excel
                            </button>
                            <button
                                onClick={() => navigate('/users/new')}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm người dùng
                            </button>
                        </div>
                    </div>

                    {/* Filter row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <select
                                value={filters.roleFilter}
                                onChange={handleRoleFilter}
                                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Tất cả vai trò</option>
                                <option value={USER_ROLES.BAN_DIEU_HANH}>Ban Điều Hành</option>
                                <option value={USER_ROLES.PHAN_DOAN_TRUONG}>Phân Đoàn Trưởng</option>
                                <option value={USER_ROLES.GIAO_LY_VIEN}>Giáo Lý Viên</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={filters.departmentFilter}
                                onChange={handleDepartmentFilter}
                                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Tất cả ngành</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={filters.classFilter}
                                onChange={handleClassFilter}
                                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                disabled={!filters.departmentFilter}
                            >
                                <option value="">
                                    {filters.departmentFilter ? 'Tất cả lớp' : 'Chọn ngành trước'}
                                </option>
                                {filteredClasses.map(cls => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <button
                                onClick={() => {
                                    setFilters({
                                        search: '',
                                        roleFilter: '',
                                        departmentFilter: '',
                                        classFilter: '',
                                        page: 1,
                                        limit: 20
                                    });
                                    setSearchInput('');
                                }}
                                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-red-200 rounded-lg transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* User Table */}
            <div className="bg-white rounded-lg shadow-sm border border-red-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-red-50 border-b border-red-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                                    Người dùng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                                    Vai trò
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                                    Ngành/Lớp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                                    Liên hệ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-red-600 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-red-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-red-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center overflow-hidden">
                                                {user.avatarUrl ? (
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt={user.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white text-sm font-medium">
                                                        {user.fullName.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-red-800">
                                                    {user.saintName && `${user.saintName} `}{user.fullName}
                                                </div>
                                                <div className="text-sm text-red-500">{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === USER_ROLES.BAN_DIEU_HANH ? 'bg-red-100 text-red-800' :
                                            user.role === USER_ROLES.PHAN_DOAN_TRUONG ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {getRoleName(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-red-700">
                                        <div className="max-w-xs">
                                            {formatClassDepartmentInfo(user)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700">
                                        {user.phoneNumber || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    navigate(`/users/${user.id}/edit`, {
                                                        state: { user },
                                                    })
                                                }
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(user.id)}
                                                className="text-yellow-600 hover:text-yellow-800"
                                                title="Reset mật khẩu"
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                            {user.isActive && (
                                                <button
                                                    onClick={() => handleDeactivate(user.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Khóa tài khoản"
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-red-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-red-700">
                                Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} trong{' '}
                                {pagination.total} kết quả
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1 border border-red-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 text-sm text-red-700">
                                    {pagination.page} / {pagination.pages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-3 py-1 border border-red-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <UserImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={handleImportSuccess}
            />
        </div>
    );
};

export default UserListPage;
