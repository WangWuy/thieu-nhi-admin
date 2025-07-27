import * as XLSX from 'xlsx';
import { validators } from '../utils/validation.jsx';

// Excel column mappings cho Students
const STUDENT_COLUMN_MAPPING = {
    // Vietnamese headers -> internal field names
    'Mã học sinh': 'studentCode',
    'Mã số': 'studentCode',
    'Student Code': 'studentCode',

    'Tên thánh': 'saintName',
    'Tên Thánh': 'saintName',
    'Saint Name': 'saintName',

    'Họ và tên': 'fullName',
    'Họ tên': 'fullName',
    'Full Name': 'fullName',
    'Tên': 'fullName',

    'Ngày sinh': 'birthDate',
    'Birth Date': 'birthDate',
    'DOB': 'birthDate',

    'Số điện thoại': 'phoneNumber',
    'SĐT': 'phoneNumber',
    'Phone': 'phoneNumber',

    'SĐT Phụ huynh 1': 'parentPhone1',
    'Phụ huynh 1': 'parentPhone1',
    'Parent Phone 1': 'parentPhone1',

    'SĐT Phụ huynh 2': 'parentPhone2',
    'Phụ huynh 2': 'parentPhone2',
    'Parent Phone 2': 'parentPhone2',

    'Địa chỉ': 'address',
    'Address': 'address',

    'Lớp': 'className',
    'Class': 'className',
    'Tên lớp': 'className',

    'Ngành': 'departmentName',
    'Department': 'departmentName',

    'Điểm chuyên cần': 'attendanceScore',
    'Attendance Score': 'attendanceScore',
    'CC': 'attendanceScore',

    'Điểm giáo lý': 'studyScore',
    'Study Score': 'studyScore',
    'GL': 'studyScore'
};

// Excel column mappings cho Users/Teachers
const USER_COLUMN_MAPPING = {
    'Username': 'username',
    'Tên đăng nhập': 'username',
    'User Name': 'username',

    'Tên thánh': 'saintName',
    'Saint Name': 'saintName',

    'Họ và tên': 'fullName',
    'Họ tên': 'fullName',
    'Full Name': 'fullName',

    'Vai trò': 'role',
    'Role': 'role',
    'Chức vụ': 'role',

    'Ngày sinh': 'birthDate',
    'Birth Date': 'birthDate',

    'Số điện thoại': 'phoneNumber',
    'SĐT': 'phoneNumber',
    'Phone': 'phoneNumber',

    'Địa chỉ': 'address',
    'Address': 'address',

    'Ngành phụ trách': 'departmentName',
    'Department': 'departmentName',
    'Ngành': 'departmentName'
};

// Role mapping
const ROLE_MAPPING = {
    'Ban Điều Hành': 'ban_dieu_hanh',
    'ban điều hành': 'ban_dieu_hanh',
    'BDH': 'ban_dieu_hanh',
    'Admin': 'ban_dieu_hanh',

    'Phân Đoàn Trưởng': 'phan_doan_truong',
    'phân đoàn trưởng': 'phan_doan_truong',
    'PDT': 'phan_doan_truong',

    'Giáo Lý Viên': 'giao_ly_vien',
    'giáo lý viên': 'giao_ly_vien',
    'GLV': 'giao_ly_vien',
    'Teacher': 'giao_ly_vien'
};

class ExcelImportService {
    // Parse Excel file
    parseExcelFile(file) {
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

                    // Get first worksheet
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Convert to JSON
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
    }

    // Map Excel headers to internal field names
    mapHeaders(headers, mapping) {
        const headerMap = {};
        const unmappedHeaders = [];

        headers.forEach((header, index) => {
            const cleanHeader = header.toString().trim();
            const mappedField = mapping[cleanHeader];

            if (mappedField) {
                headerMap[index] = mappedField;
            } else {
                unmappedHeaders.push({ index, header: cleanHeader });
            }
        });

        return { headerMap, unmappedHeaders };
    }

    // Convert row data to object
    convertRowToObject(row, headerMap) {
        const obj = {};

        Object.entries(headerMap).forEach(([index, fieldName]) => {
            const cellValue = row[parseInt(index)];
            obj[fieldName] = this.cleanCellValue(cellValue);
        });

        return obj;
    }

    // Clean cell values
    cleanCellValue(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        // Handle dates
        if (value instanceof Date) {
            return value.toISOString().split('T')[0];
        }

        // Handle numbers
        if (typeof value === 'number') {
            return value;
        }

        // Handle strings
        if (typeof value === 'string') {
            return value.toString().trim();
        }

        return value.toString().trim();
    }

    // Process student data
    async processStudentData(excelData, classes = []) {
        const { headers, data } = excelData;
        const { headerMap, unmappedHeaders } = this.mapHeaders(headers, STUDENT_COLUMN_MAPPING);

        const results = {
            success: [],
            errors: [],
            warnings: [],
            summary: {
                total: data.length,
                processed: 0,
                successful: 0,
                failed: 0
            }
        };

        // Create class lookup map
        const classLookup = new Map();
        classes.forEach(cls => {
            classLookup.set(cls.name.toLowerCase(), cls.id);
            classLookup.set(`${cls.name.toLowerCase()} (${cls.department.displayName.toLowerCase()})`, cls.id);
        });

        for (let i = 0; i < data.length; i++) {
            const rowIndex = i + 2; // Excel row number (1-indexed + header)

            try {
                const rowData = this.convertRowToObject(data[i], headerMap);

                // Skip empty rows
                if (!rowData.fullName && !rowData.studentCode) {
                    continue;
                }

                results.summary.processed++;

                // Validate required fields
                const validationErrors = this.validateStudentRow(rowData, rowIndex);
                if (validationErrors.length > 0) {
                    results.errors.push({
                        row: rowIndex,
                        data: rowData,
                        errors: validationErrors
                    });
                    results.summary.failed++;
                    continue;
                }

                // Map class name to class ID
                if (rowData.className) {
                    const classId = this.findClassId(rowData.className, rowData.departmentName, classLookup);
                    if (classId) {
                        rowData.classId = classId;
                    } else {
                        results.warnings.push({
                            row: rowIndex,
                            message: `Không tìm thấy lớp "${rowData.className}"`
                        });
                    }
                }

                // Clean up data
                delete rowData.className;
                delete rowData.departmentName;

                results.success.push({
                    row: rowIndex,
                    data: rowData
                });
                results.summary.successful++;

            } catch (error) {
                results.errors.push({
                    row: rowIndex,
                    data: data[i],
                    errors: [`Lỗi xử lý: ${error.message}`]
                });
                results.summary.failed++;
            }
        }

        return {
            ...results,
            unmappedHeaders,
            recommendations: this.generateRecommendations('student', unmappedHeaders)
        };
    }

    // Process user/teacher data
    async processUserData(excelData, departments = []) {
        const { headers, data } = excelData;
        const { headerMap, unmappedHeaders } = this.mapHeaders(headers, USER_COLUMN_MAPPING);

        const results = {
            success: [],
            errors: [],
            warnings: [],
            summary: {
                total: data.length,
                processed: 0,
                successful: 0,
                failed: 0
            }
        };

        // Create department lookup
        const deptLookup = new Map();
        departments.forEach(dept => {
            deptLookup.set(dept.displayName.toLowerCase(), dept.id);
        });

        for (let i = 0; i < data.length; i++) {
            const rowIndex = i + 2;

            try {
                const rowData = this.convertRowToObject(data[i], headerMap);

                // Skip empty rows
                if (!rowData.fullName && !rowData.username) {
                    continue;
                }

                results.summary.processed++;

                // Map role
                if (rowData.role) {
                    const mappedRole = ROLE_MAPPING[rowData.role];
                    if (mappedRole) {
                        rowData.role = mappedRole;
                    } else {
                        results.warnings.push({
                            row: rowIndex,
                            message: `Vai trò "${rowData.role}" không được nhận diện. Mặc định là Giáo Lý Viên.`
                        });
                        rowData.role = 'giao_ly_vien';
                    }
                }

                // Map department
                if (rowData.departmentName && rowData.role === 'phan_doan_truong') {
                    const deptId = deptLookup.get(rowData.departmentName.toLowerCase());
                    if (deptId) {
                        rowData.departmentId = deptId;
                    }
                }

                // Generate username if not provided
                if (!rowData.username) {
                    rowData.username = this.generateUsername(rowData.fullName, rowData.role);
                }

                // Set default password
                rowData.password = 'ThieuNhi2024!';

                // Validate
                const validationErrors = this.validateUserRow(rowData, rowIndex);
                if (validationErrors.length > 0) {
                    results.errors.push({
                        row: rowIndex,
                        data: rowData,
                        errors: validationErrors
                    });
                    results.summary.failed++;
                    continue;
                }

                // Clean up
                delete rowData.departmentName;

                results.success.push({
                    row: rowIndex,
                    data: rowData
                });
                results.summary.successful++;

            } catch (error) {
                results.errors.push({
                    row: rowIndex,
                    data: data[i],
                    errors: [`Lỗi xử lý: ${error.message}`]
                });
                results.summary.failed++;
            }
        }

        return {
            ...results,
            unmappedHeaders,
            recommendations: this.generateRecommendations('user', unmappedHeaders)
        };
    }

    // Validate student row
    validateStudentRow(data, rowIndex) {
        const errors = [];

        // Required fields
        if (!data.fullName) {
            errors.push('Họ tên là bắt buộc');
        }

        if (!data.studentCode) {
            errors.push('Mã học sinh là bắt buộc');
        } else {
            const codeError = validators.studentCode(data.studentCode);
            if (codeError) {
                errors.push(codeError);
            }
        }

        // Optional validations
        if (data.phoneNumber) {
            const phoneError = validators.phoneVN(data.phoneNumber);
            if (phoneError) {
                errors.push(`SĐT học sinh: ${phoneError}`);
            }
        }

        if (data.parentPhone1) {
            const phone1Error = validators.phoneVN(data.parentPhone1);
            if (phone1Error) {
                errors.push(`SĐT phụ huynh 1: ${phone1Error}`);
            }
        }

        if (data.parentPhone2) {
            const phone2Error = validators.phoneVN(data.parentPhone2);
            if (phone2Error) {
                errors.push(`SĐT phụ huynh 2: ${phone2Error}`);
            }
        }

        if (data.birthDate) {
            const ageError = validators.age(data.birthDate, 5, 18);
            if (ageError) {
                errors.push(ageError);
            }
        }

        return errors;
    }

    // Validate user row
    validateUserRow(data, rowIndex) {
        const errors = [];

        if (!data.fullName) {
            errors.push('Họ tên là bắt buộc');
        }

        if (!data.username) {
            errors.push('Username là bắt buộc');
        } else {
            const usernameError = validators.username(data.username);
            if (usernameError) {
                errors.push(usernameError);
            }
        }

        if (data.phoneNumber) {
            const phoneError = validators.phoneVN(data.phoneNumber);
            if (phoneError) {
                errors.push(phoneError);
            }
        }

        return errors;
    }

    // Find class ID by name
    findClassId(className, departmentName, classLookup) {
        const cleanName = className.toLowerCase().trim();

        // Try exact match first
        if (classLookup.has(cleanName)) {
            return classLookup.get(cleanName);
        }

        // Try with department
        if (departmentName) {
            const withDept = `${cleanName} (${departmentName.toLowerCase().trim()})`;
            if (classLookup.has(withDept)) {
                return classLookup.get(withDept);
            }
        }

        // Try partial match
        for (const [key, value] of classLookup.entries()) {
            if (key.includes(cleanName) || cleanName.includes(key)) {
                return value;
            }
        }

        return null;
    }

    // Generate username
    generateUsername(fullName, role) {
        const words = fullName.trim().split(' ');
        const lastName = words[words.length - 1];
        const rolePrefix = {
            'ban_dieu_hanh': 'bdh',
            'phan_doan_truong': 'pdt',
            'giao_ly_vien': 'glv'
        };

        const prefix = rolePrefix[role] || 'user';
        const base = this.removeAccents(lastName).toLowerCase();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        return `${prefix}_${base}_${random}`;
    }

    // Remove Vietnamese accents
    removeAccents(str) {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    }

    // Generate recommendations
    generateRecommendations(type, unmappedHeaders) {
        const recommendations = [];

        if (unmappedHeaders.length > 0) {
            recommendations.push({
                type: 'warning',
                message: `Có ${unmappedHeaders.length} cột không được nhận diện`,
                details: unmappedHeaders.map(h => h.header)
            });
        }

        if (type === 'student') {
            recommendations.push({
                type: 'info',
                message: 'Đảm bảo file Excel có các cột: Mã học sinh, Họ tên, Lớp',
                details: ['Mã học sinh phải có format TNxxxx', 'Lớp phải tồn tại trong hệ thống']
            });
        } else {
            recommendations.push({
                type: 'info',
                message: 'Đảm bảo file Excel có các cột: Họ tên, Vai trò',
                details: ['Username sẽ được tự động tạo nếu không có', 'Mật khẩu mặc định: ThieuNhi2024!']
            });
        }

        return recommendations;
    }

    // Export template
    generateTemplate(type) {
        let headers, sampleData;

        if (type === 'student') {
            headers = [
                'Mã học sinh', 'Tên thánh', 'Họ và tên', 'Ngày sinh',
                'Số điện thoại', 'SĐT Phụ huynh 1', 'SĐT Phụ huynh 2',
                'Địa chỉ', 'Lớp', 'Ngành', 'Điểm chuyên cần', 'Điểm giáo lý'
            ];
            sampleData = [
                ['TN0001', 'Maria', 'Nguyễn Thị A', '2015-05-15', '0901234567', '0987654321', '', '123 ABC Street', 'Chiên 1', 'Chiên', '8.5', '9.0'],
                ['TN0002', 'Joseph', 'Trần Văn B', '2014-08-20', '', '0912345678', '0876543210', '456 XYZ Street', 'Ấu 2', 'Ấu', '7.0', '8.5']
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
    }
}

export default new ExcelImportService();