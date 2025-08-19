import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Key,
    Filter,
    ChevronLeft,
    ChevronRight,
    UserX,
    Upload
} from 'lucide-react';
import { userService } from '../../services/userService';
import { USER_ROLES } from '../../utils/constants';
import { getRoleName } from '../../utils/helpers';
import UserModal from './UserModal';
import UserImportModal from './UserImportModal';

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        roleFilter: '',
        page: 1,
        limit: 20
    });
    const [pagination, setPagination] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [filters]);

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

    const handleSearch = (e) => {
        setFilters(prev => ({
            ...prev,
            search: e.target.value,
            page: 1
        }));
    };

    const handleRoleFilter = (e) => {
        setFilters(prev => ({
            ...prev,
            roleFilter: e.target.value,
            page: 1
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
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
            fetchUsers(); // Refresh list
            alert('Khóa tài khoản thành công!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    const handleModalSave = () => {
        fetchUsers();
        setSelectedUser(null);
        setShowCreateModal(false);
        setShowEditModal(false);
    };

    const handleModalClose = () => {
        setSelectedUser(null);
        setShowCreateModal(false);
        setShowEditModal(false);
    };

    const handleImportSuccess = () => {
        fetchUsers(); // Refresh user list after successful import
        setShowImportModal(false);
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
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, username..."
                                value={filters.search}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-48">
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
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Import Excel
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm người dùng
                        </button>
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
                                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">
                                                    {user.fullName.charAt(0)}
                                                </span>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700">
                                        {user.department ? user.department.displayName :
                                            user.classTeachers?.length > 0 ?
                                                user.classTeachers.map(ct => ct.class.name).join(', ') :
                                                '-'}
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
                                                onClick={() => handleEditUser(user)}
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

            {/* Modals */}
            <UserModal
                user={null}
                isOpen={showCreateModal}
                onClose={handleModalClose}
                onSave={handleModalSave}
            />

            <UserModal
                user={selectedUser}
                isOpen={showEditModal}
                onClose={handleModalClose}
                onSave={handleModalSave}
            />

            <UserImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={handleImportSuccess}
            />
        </div>
    );
};

export default UserListPage;