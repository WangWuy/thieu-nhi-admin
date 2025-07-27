import { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Users,
    UserPlus,
    GraduationCap,
    BookOpen
} from 'lucide-react';
import { classService } from '../../services/classService';
import { departmentService } from '../../services/departmentService.js';
import ClassModal from './ClassModal.jsx';

const ClassListPage = () => {
    const [classes, setClasses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

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

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-red-100 rounded w-1/4 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-red-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    const groupedClasses = departments.map(dept => ({
        ...dept,
        classes: classes.filter(cls => cls.departmentId === dept.id)
    }));

    return (
        <div className="space-y-6">
            {/* Action bar */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Thêm lớp
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Classes by Department */}
            {groupedClasses.map(department => (
                <div key={department.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-red-600" />
                        <h2 className="text-xl font-semibold text-red-800">
                            Ngành {department.displayName}
                        </h2>
                        <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                            {department.classes.length} lớp
                        </span>
                    </div>

                    {department.classes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {department.classes.map(classItem => (
                                <div key={classItem.id} className="bg-white rounded-lg p-6 shadow-sm border border-red-100 hover:shadow-md hover:border-red-200 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                                <GraduationCap className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-red-800">{classItem.name}</h3>
                                                <p className="text-sm text-red-600">{department.displayName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEditClass(classItem)}
                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClass(classItem.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Teachers */}
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-red-700 mb-2">Giáo viên:</h4>
                                        {classItem.classTeachers?.length > 0 ? (
                                            <div className="space-y-1">
                                                {classItem.classTeachers.map(ct => (
                                                    <div key={ct.id} className="flex items-center gap-2 text-sm">
                                                        <div className={`w-2 h-2 rounded-full ${ct.isPrimary ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                                                        <span className={ct.isPrimary ? 'font-medium text-red-800' : 'text-red-600'}>
                                                            {ct.user.saintName && `${ct.user.saintName} `}{ct.user.fullName}
                                                        </span>
                                                        {ct.isPrimary && (
                                                            <span className="bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">Chính</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-red-400">Chưa có giáo viên</p>
                                        )}
                                    </div>

                                    {/* Students Count */}
                                    <div className="flex items-center justify-between pt-4 border-t border-red-100">
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <Users className="w-4 h-4" />
                                            <span>{classItem._count?.students || 0} học sinh</span>
                                        </div>

                                        <a
                                            href={`/students?classId=${classItem.id}`}
                                            className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                                        >
                                            Xem chi tiết
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
                            <GraduationCap className="w-8 h-8 text-red-400 mx-auto mb-2" />
                            <p className="text-red-500">Chưa có lớp nào trong ngành {department.displayName}</p>
                        </div>
                    )}
                </div>
            ))}

            {/* Empty State */}
            {classes.length === 0 && !loading && (
                <div className="text-center py-12">
                    <GraduationCap className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <div className="text-red-500 mb-4">Chưa có lớp học nào</div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                        Tạo lớp đầu tiên
                    </button>
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