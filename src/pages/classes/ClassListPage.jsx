import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Edit,
    Trash2,
    Users,
    UserPlus,
    GraduationCap,
    BookOpen,
    Search,
    Filter,
    Eye
} from 'lucide-react';
import { classService } from '../../services/classService.js';
import { departmentService } from '../../services/departmentService.js';
import ClassModal from '../../components/classes/ClassModal.jsx';

const ClassListPage = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [classData, deptData] = await Promise.all([
                classService.getClasses(),
                departmentService.getDepartments()
            ]);
            setClasses(classData);
            setDepartments(deptData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClass = (classItem) => {
        setSelectedClass(classItem);
        setShowEditModal(true);
    };

    const handleDeleteClass = async (classId) => {
        if (!confirm('Bạn có chắc muốn xóa lớp này?')) return;

        try {
            await classService.deleteClass(classId);
            fetchData();
            alert('Xóa lớp thành công!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    const handleModalSave = () => {
        fetchData();
        setSelectedClass(null);
        setShowCreateModal(false);
        setShowEditModal(false);
    };

    const handleModalClose = () => {
        setSelectedClass(null);
        setShowCreateModal(false);
        setShowEditModal(false);
    };

    // Filter classes
    const filteredClasses = classes.filter(classItem => {
        const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = departmentFilter === '' || classItem.departmentId === parseInt(departmentFilter);
        return matchesSearch && matchesDepartment;
    });

    const formatTeachers = (classTeachers) => {
        if (!classTeachers || classTeachers.length === 0) {
            return (
                <div className="text-sm text-gray-500">
                    Chưa có GLV
                </div>
            );
        }

        const primary = classTeachers.find(ct => ct.isPrimary);
        const others = classTeachers.filter(ct => !ct.isPrimary);
        
        const formatName = (teacher) => {
            return `${teacher.user.saintName ? teacher.user.saintName + ' ' : ''}${teacher.user.fullName}`;
        };

        return (
            <div className="space-y-1">
                {/* GLV chính */}
                {primary && (
                    <div className="text-sm text-red-700 font-medium">
                        {formatName(primary)}
                    </div>
                )}
                
                {/* GLV phụ */}
                {others.map((teacher, index) => (
                    <div key={teacher.id} className="text-xs text-gray-500">
                        {formatName(teacher)}
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-red-100 rounded w-1/4 animate-pulse"></div>
                <div className="h-96 bg-red-100 rounded animate-pulse"></div>
            </div>
        );
    }

    const groupedClasses = departments.map(dept => ({
        ...dept,
        classes: filteredClasses.filter(cls => cls.departmentId === dept.id)
    })).filter(dept => dept.classes.length > 0);

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="bg-gradient-to-r from-red-50 to-amber-50 p-4 rounded-lg shadow-sm border border-red-100">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm lớp..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 search-input"
                            />
                        </div>
                    </div>
                    
                    <div className="w-full md:w-48">
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
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

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm lớp
                    </button>
                </div>

                {/* Stats */}
                <div className="mt-4 flex gap-6 text-sm">
                    <span className="text-red-700">
                        <strong>{filteredClasses.length}</strong> lớp
                    </span>
                    <span className="text-red-700">
                        <strong>{groupedClasses.length}</strong> ngành
                    </span>
                    <span className="text-red-700">
                        <strong>{filteredClasses.reduce((sum, cls) => sum + (cls._count?.students || 0), 0)}</strong> thiếu nhi
                    </span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Classes Table by Department */}
            {groupedClasses.length > 0 ? (
                <div className="space-y-6">
                    {groupedClasses.map(department => (
                        <div key={department.id} className="bg-white rounded-lg shadow-sm border border-red-100">
                            {/* Department Header */}
                            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-red-600" />
                                    <h3 className="text-lg font-semibold text-red-800">
                                        Ngành {department.displayName}
                                    </h3>
                                    <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                                        {department.classes.length} lớp
                                    </span>
                                </div>
                            </div>

                            {/* Classes Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                Tên lớp
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                Giáo lý viên
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                Thiếu nhi
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {department.classes.map(classItem => (
                                            <tr key={classItem.id} className="hover:bg-red-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                                                            <GraduationCap className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-red-800">
                                                                {classItem.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {formatTeachers(classItem.classTeachers)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Users className="w-4 h-4 text-red-500 mr-1" />
                                                        <span className="text-sm font-medium text-red-700">
                                                            {classItem._count?.students || 0}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => navigate(`/students?classId=${classItem.id}`)}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Xem thiếu nhi"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClass(classItem)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClass(classItem.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-red-100">
                    <GraduationCap className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <div className="text-red-500 mb-4">
                        {searchTerm || departmentFilter ? 'Không tìm thấy lớp phù hợp' : 'Chưa có lớp học nào'}
                    </div>
                    {!searchTerm && !departmentFilter && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            Tạo lớp đầu tiên
                        </button>
                    )}
                </div>
            )}

            {/* Modals */}
            <ClassModal
                classItem={null}
                isOpen={showCreateModal}
                onClose={handleModalClose}
                onSave={handleModalSave}
            />

            <ClassModal
                classItem={selectedClass}
                isOpen={showEditModal}
                onClose={handleModalClose}
                onSave={handleModalSave}
            />
        </div>
    );
};

export default ClassListPage;