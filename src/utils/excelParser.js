import * as XLSX from 'xlsx';

// Field mappings
export const STUDENT_MAPPINGS = {
    'studentCode': ['Mã học sinh', 'Mã TN', 'Student Code', 'Ma hoc sinh', 'Code', 'ID', 'STT'],
    'saintName': ['Tên thánh', 'TÊN THÁNH', 'Saint Name', 'Ten thanh', 'Saint'],
    'fullName': ['Họ và tên', 'HỌ VÀ TÊN', 'Full Name', 'Tên', 'Ho ten', 'Name'],
    'birthDate': ['Ngày sinh', 'NGÀY SINH', 'Birth Date', 'DOB', 'Ngay sinh'],
    'phoneNumber': ['Số điện thoại', 'SĐT', 'Phone', 'So dien thoai', 'Mobile'],
    'parentPhone1': ['SĐT 1', 'SDT 1', 'Parent Phone 1', 'SDT PH 1', 'Phụ huynh 1'],
    'parentPhone2': ['SĐT 2', 'SDT 2', 'Parent Phone 2', 'SDT PH 2', 'Phụ huynh 2'],
    'address': ['Địa chỉ', 'ĐỊA CHỈ', 'Address', 'Dia chi', 'Nơi ở'],
    'className': ['Lớp', 'LỚP', 'Class', 'Lop', 'LỚP MỚI', 'LỚP CŨ'],
    'departmentName': ['Ngành', 'Department', 'Nganh', 'Khối'],
    'attendanceScore': ['Điểm chuyên cần', 'CC', 'Attendance Score'],
    'studyScore': ['Điểm giáo lý', 'GL', 'Study Score']
};

export const USER_MAPPINGS = {
    'username': ['Username', 'Tên đăng nhập', 'User Name', 'Login'],
    'saintName': ['Tên thánh', 'Saint Name', 'Ten thanh'],
    'fullName': ['Họ và tên', 'Full Name', 'Tên', 'Ho ten', 'Name'],
    'role': ['Vai trò', 'Role', 'Chức vụ', 'Position'],
    'phoneNumber': ['Số điện thoại', 'SĐT', 'Phone', 'Mobile'],
    'birthDate': ['Ngày sinh', 'Birth Date', 'DOB'],
    'address': ['Địa chỉ', 'Address', 'Dia chi'],
    'departmentName': ['Ngành', 'Department', 'Ngành phụ trách']
};

// Parse Excel file
export const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, {
                    type: 'binary',
                    cellDates: true,
                    cellNF: false,
                    cellText: false
                });

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: '',
                    blankrows: false
                });

                if (jsonData.length === 0) {
                    throw new Error('File Excel rỗng');
                }

                resolve({
                    headers: jsonData[0],
                    data: jsonData.slice(1),
                    sheetName: firstSheetName,
                    totalRows: jsonData.length - 1
                });
            } catch (error) {
                reject(new Error(`Lỗi đọc file Excel: ${error.message}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Không thể đọc file'));
        };

        reader.readAsBinaryString(file);
    });
};

// Auto-detect headers
export const autoDetectHeaders = (headers, type = 'student') => {
    const mappings = type === 'student' ? STUDENT_MAPPINGS : USER_MAPPINGS;
    const detected = {};

    headers.forEach((header, index) => {
        const normalizedHeader = header.toString().trim();

        for (const [fieldName, variations] of Object.entries(mappings)) {
            if (variations.some(variation =>
                normalizedHeader.toLowerCase().includes(variation.toLowerCase()) ||
                variation.toLowerCase().includes(normalizedHeader.toLowerCase())
            )) {
                detected[index] = {
                    fieldName,
                    originalHeader: header,
                    confidence: 1.0
                };
                break;
            }
        }
    });

    return detected;
};

// Clean cell values
export const cleanCellValue = (value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (value instanceof Date) {
        return value.toISOString().split('T')[0];
    }

    if (typeof value === 'number') {
        return value;
    }

    return value.toString().trim();
};

// Validate row data
export const validateRow = (data, type) => {
    const errors = [];

    if (type === 'student') {
        if (!data.fullName) errors.push('Họ tên là bắt buộc');
        if (!data.studentCode) errors.push('Mã học sinh là bắt buộc');

        if (data.phoneNumber && !/^(\+84|0)[3|5|7|8|9][0-9]{8}$/.test(data.phoneNumber)) {
            errors.push('Số điện thoại không hợp lệ');
        }
    } else {
        if (!data.fullName) errors.push('Họ tên là bắt buộc');
        if (!data.username) errors.push('Username là bắt buộc');
    }

    return errors;
};

// Generate template
export const generateTemplate = (type) => {
    let headers, sampleData;

    if (type === 'student') {
        headers = [
            'Mã học sinh', 'Tên thánh', 'Họ và tên', 'Ngày sinh',
            'Số điện thoại', 'SĐT 1', 'SĐT 2',
            'Địa chỉ', 'Lớp', 'Ngành'
        ];
        sampleData = [
            ['TN0001', 'Maria', 'Nguyễn Thị A', '2015-05-15', '0901234567', '0987654321', '', '123 ABC Street', 'Chiên 1', 'Chiên'],
            ['TN0002', 'Joseph', 'Trần Văn B', '2014-08-20', '', '0912345678', '0876543210', '456 XYZ Street', 'Ấu 2', 'Ấu']
        ];
    } else {
        headers = [
            'Username', 'Tên thánh', 'Họ và tên', 'Vai trò', 'Ngày sinh',
            'Số điện thoại', 'Địa chỉ', 'Ngành phụ trách'
        ];
        sampleData = [
            ['glv_nguyen_001', 'Anna', 'Nguyễn Thị C', 'Giáo Lý Viên', '1990-03-15', '0903456789', '789 DEF Street', ''],
            ['pdt_tran_001', 'Peter', 'Trần Văn D', 'Phân Đoàn Trưởng', '1985-07-10', '0904567890', '321 GHI Street', 'Chiên']
        ];
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === 'student' ? 'Students' : 'Users');

    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
};