import { GraduationCap, Edit, Trash2, Award, RotateCcw, Save, X } from "lucide-react";
import ScoreEditCell from "./ScoreEditCell";

const StudentTable = ({
  students,
  editingScores,
  savingScores,
  startEditingScores,
  cancelEditingScores,
  updateScoreValue,
  saveScores,
  onEditStudent,
  onDeleteStudent,
  onRestoreStudent,
  currentUser,
}) => {
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const parseStudentName = (saintName, fullName) => {
    if (!fullName) return { saintNameWithMiddleName: "", firstName: "" };
    const words = fullName.trim().split(" ");
    if (words.length === 0) return { saintNameWithMiddleName: "", firstName: "" };
    const firstName = words[words.length - 1];
    const middleName = words.slice(0, -1).join(" ");
    const saintNameWithMiddleName = saintName ? `${saintName} ${middleName}`.trim() : middleName;
    return { saintNameWithMiddleName, firstName };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên thánh + Họ</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp / Tuổi</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liên hệ</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-blue-600 uppercase border-l border-blue-200">45' HK1</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-blue-600 uppercase">Thi HK1</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-blue-600 uppercase">45' HK2</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-blue-600 uppercase">Thi HK2</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-blue-600 uppercase">TB Giáo lý</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-green-600 uppercase">Điểm danh T5</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-green-600 uppercase">Điểm danh CN</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-green-600 uppercase">TB Điểm danh</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-purple-600 uppercase">Tổng TB</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => {
            const age = calculateAge(student.birthDate);
            const isEditingThisStudent = editingScores[student.id];
            const isSaving = savingScores[student.id];
            const { saintNameWithMiddleName, firstName } = parseStudentName(student.saintName, student.fullName);

            return (
              <tr
                key={student.id}
                className={`hover:bg-gray-50 ${isEditingThisStudent ? "bg-blue-50" : ""} ${!student.isActive ? "bg-red-50 opacity-75" : ""
                  }`}
              >
                {/* Saint + Middle Name */}
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${!student.isActive ? "bg-gray-400" : "bg-blue-600"
                        }`}
                    >
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.fullName || 'Student'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <GraduationCap className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div
                        className={`text-sm font-medium ${!student.isActive ? "text-gray-500" : "text-gray-900"
                          }`}
                      >
                        {saintNameWithMiddleName}
                        {!student.isActive && (
                          <span className="ml-2 text-xs text-red-600 font-semibold">(Đã xóa)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{student.studentCode}</div>
                    </div>
                  </div>
                </td>

                {/* First name */}
                <td className="px-3 py-4 align-top">
                  <div
                    className={`text-sm font-medium mt-1 ${!student.isActive ? "text-gray-500" : "text-gray-900"
                      }`}
                  >
                    {firstName}
                  </div>
                </td>

                {/* Class + Age */}
                <td className="px-3 py-4">
                  <div className="text-sm font-medium text-gray-900">{student.class.name}</div>
                  {age && (
                    <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      {age} tuổi
                    </span>
                  )}
                </td>

                {/* Parent contacts */}
                <td className="px-3 py-4 text-xs space-y-1">
                  {student.parentPhone1 ? (
                    <div className="text-gray-900 font-medium">{student.parentPhone1}</div>
                  ) : (
                    <span className="text-gray-400 italic">Chưa có SĐT</span>
                  )}
                  {student.parentPhone2 && <div className="text-gray-700">{student.parentPhone2}</div>}
                </td>

                {/* Scores */}
                {["study45Hk1", "examHk1", "study45Hk2", "examHk2"].map((field, idx) => (
                  <td key={idx} className="px-2 py-4 text-center border-l border-blue-100">
                    <ScoreEditCell
                      studentId={student.id}
                      field={field}
                      value={student[field]}
                      editingScores={editingScores}
                      updateScoreValue={updateScoreValue}
                    />
                  </td>
                ))}

                {/* Averages */}
                <td className="px-2 py-4 text-center bg-blue-50 text-blue-700 font-bold">
                  {parseFloat(student.studyAverage || 0).toFixed(2)}
                </td>
                <td className="px-2 py-4 text-center bg-green-50 text-green-700 font-medium">
                  {student.thursdayScore || 0}
                </td>
                <td className="px-2 py-4 text-center bg-green-50 text-green-700 font-medium">
                  {student.sundayScore || 0}
                </td>
                <td className="px-2 py-4 text-center bg-green-50 text-green-700 font-bold">
                  {parseFloat(student.attendanceAverage || 0).toFixed(2)}
                </td>
                <td className="px-2 py-4 text-center bg-purple-50 text-purple-700 font-bold">
                  {parseFloat(student.finalAverage || 0).toFixed(2)}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isEditingThisStudent ? (
                      <>
                        <button
                          onClick={() => saveScores(student.id)}
                          disabled={isSaving}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                        >
                          {isSaving ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => cancelEditingScores(student.id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditingScores(student.id, student)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={!student.isActive}
                        >
                          <Award className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={!student.isActive}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {student.isActive ? (
                          <button
                            onClick={() => onDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onRestoreStudent(student.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;