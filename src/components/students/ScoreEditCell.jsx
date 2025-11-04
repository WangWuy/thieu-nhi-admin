const ScoreEditCell = ({ studentId, field, value, editingScores, updateScoreValue }) => {
    const isEditing = editingScores[studentId];
  
    const handleChange = (e) => {
      let input = e.target.value;
  
      // ✅ Cho phép số, dấu phẩy và dấu chấm
      if (!/^[0-9.,]*$/.test(input)) return;
  
      // ✅ Cho phép người dùng gõ tạm thời "." hoặc "," mà chưa có số
      if (input === "." || input === ",") {
        updateScoreValue(studentId, field, input);
        return;
      }
  
      // ✅ Chuyển dấu phẩy sang dấu chấm để parseFloat đúng
      const normalized = input.replace(",", ".");
      const num = parseFloat(normalized);
  
      // ✅ Cho phép rỗng (để xóa input)
      if (input === "") {
        updateScoreValue(studentId, field, "");
        return;
      }
  
      // ✅ Nếu nhập hợp lệ và nằm trong khoảng 0–10 → chấp nhận
      if (!isNaN(num) && num >= 0 && num <= 10) {
        updateScoreValue(studentId, field, input);
      }
      // 🚫 Nếu vượt quá → bỏ qua (không cập nhật state)
    };
  
    const handleBlur = (e) => {
      const normalized = e.target.value.replace(",", ".");
      let num = parseFloat(normalized);
  
      if (isNaN(num)) num = 0;
      if (num < 0) num = 0;
      if (num > 10) num = 10;
  
      num = Math.round(num * 10) / 10;
      updateScoreValue(studentId, field, num);
    };
  
    if (isEditing) {
      return (
        <input
          type="text"
          inputMode="decimal"
          value={editingScores[studentId][field]}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-16 px-2 py-1 text-xs border border-blue-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.0"
        />
      );
    }
  
    return (
      <span className="text-sm font-medium text-gray-900">
        {parseFloat(value || 0).toFixed(1)}
      </span>
    );
  };
  
  export default ScoreEditCell;
  