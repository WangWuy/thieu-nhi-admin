// Validation utility functions
export const validators = {
    // Required field validation
    required: (value, fieldName = 'Trường này') => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return `${fieldName} là bắt buộc`;
        }
        return null;
    },

    // Email validation
    email: (value) => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : 'Email không hợp lệ';
    },

    // Vietnamese phone number validation
    phoneVN: (value) => {
        if (!value) return null;
        const phoneRegex = /^(\+84|0)[3|5|7|8|9][0-9]{8}$/;
        return phoneRegex.test(value) ? null : 'Số điện thoại không hợp lệ (VN format)';
    },

    // Password validation
    password: (value, minLength = 6) => {
        if (!value) return null;
        if (value.length < minLength) {
            return `Mật khẩu phải có ít nhất ${minLength} ký tự`;
        }
        return null;
    },

    // Strong password validation
    strongPassword: (value) => {
        if (!value) return null;
        const hasLower = /[a-z]/.test(value);
        const hasUpper = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        const minLength = value.length >= 8;

        if (!minLength) return 'Mật khẩu phải có ít nhất 8 ký tự';
        if (!hasLower) return 'Mật khẩu phải có ít nhất 1 chữ thường';
        if (!hasUpper) return 'Mật khẩu phải có ít nhất 1 chữ hoa';
        if (!hasNumber) return 'Mật khẩu phải có ít nhất 1 số';
        if (!hasSpecial) return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';

        return null;
    },

    // Confirm password validation
    confirmPassword: (value, originalPassword) => {
        if (!value) return null;
        return value === originalPassword ? null : 'Xác nhận mật khẩu không khớp';
    },

    // Username validation
    username: (value) => {
        if (!value) return null;
        if (value.length < 3) return 'Username phải có ít nhất 3 ký tự';
        if (value.length > 50) return 'Username không được quá 50 ký tự';
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        return usernameRegex.test(value) ? null : 'Username chỉ được chứa chữ, số và dấu gạch dưới';
    },

    // Full name validation
    fullName: (value) => {
        if (!value) return null;
        if (value.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
        if (value.length > 100) return 'Họ tên không được quá 100 ký tự';
        return null;
    },

    // Student code validation
    studentCode: (value) => {
        if (!value) return null;
        const codeRegex = /^TN[0-9]{4}$/;
        return codeRegex.test(value) ? null : 'Mã học sinh phải có format TNxxxx (4 số)';
    },

    // Age validation
    age: (birthDate, minAge = 5, maxAge = 80) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        if (age < minAge) return `Tuổi phải từ ${minAge} trở lên`;
        if (age > maxAge) return `Tuổi không được quá ${maxAge}`;
        return null;
    },

    // Date validation
    date: (value, allowFuture = false) => {
        if (!value) return null;
        const date = new Date(value);
        const today = new Date();

        if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
        if (!allowFuture && date > today) return 'Ngày không được trong tương lai';

        return null;
    },

    // Numeric validation
    number: (value, min = null, max = null) => {
        if (!value && value !== 0) return null;
        const num = parseFloat(value);

        if (isNaN(num)) return 'Giá trị phải là số';
        if (min !== null && num < min) return `Giá trị phải >= ${min}`;
        if (max !== null && num > max) return `Giá trị phải <= ${max}`;

        return null;
    },

    // Text length validation
    length: (value, min = 0, max = Infinity) => {
        if (!value) return null;
        const length = value.toString().length;

        if (length < min) return `Phải có ít nhất ${min} ký tự`;
        if (length > max) return `Không được quá ${max} ký tự`;

        return null;
    },

    // Array validation
    array: (value, minItems = 0, maxItems = Infinity) => {
        if (!Array.isArray(value)) return 'Giá trị phải là danh sách';

        if (value.length < minItems) return `Phải có ít nhất ${minItems} mục`;
        if (value.length > maxItems) return `Không được quá ${maxItems} mục`;

        return null;
    },

    // Custom regex validation
    regex: (value, pattern, message) => {
        if (!value) return null;
        return pattern.test(value) ? null : message;
    }
};

// Validation schemas for different forms
export const validationSchemas = {
    // Login form
    login: {
        username: [
            (value) => validators.required(value, 'Tên đăng nhập'),
            (value) => validators.username(value)
        ],
        password: [
            (value) => validators.required(value, 'Mật khẩu'),
            (value) => validators.password(value)
        ]
    },

    // User creation/update
    user: {
        username: [
            (value) => validators.required(value, 'Tên đăng nhập'),
            (value) => validators.username(value)
        ],
        password: [
            (value) => validators.required(value, 'Mật khẩu'),
            (value) => validators.strongPassword(value)
        ],
        confirmPassword: [
            (value, formData) => validators.required(value, 'Xác nhận mật khẩu'),
            (value, formData) => validators.confirmPassword(value, formData.password)
        ],
        fullName: [
            (value) => validators.required(value, 'Họ và tên'),
            (value) => validators.fullName(value)
        ],
        saintName: [
            (value) => validators.length(value, 0, 50)
        ],
        phoneNumber: [
            (value) => validators.phoneVN(value)
        ],
        birthDate: [
            (value) => validators.date(value),
            (value) => validators.age(value, 16, 80)
        ],
        role: [
            (value) => validators.required(value, 'Vai trò'),
            (value) => ['ban_dieu_hanh', 'phan_doan_truong', 'giao_ly_vien'].includes(value)
                ? null : 'Vai trò không hợp lệ'
        ]
    },

    // Student creation/update
    student: {
        studentCode: [
            (value) => validators.required(value, 'Mã học sinh'),
            (value) => validators.studentCode(value)
        ],
        fullName: [
            (value) => validators.required(value, 'Họ và tên'),
            (value) => validators.fullName(value)
        ],
        saintName: [
            (value) => validators.length(value, 0, 50)
        ],
        classId: [
            (value) => validators.required(value, 'Lớp học'),
            (value) => validators.number(value, 1)
        ],
        birthDate: [
            (value) => validators.date(value),
            (value) => validators.age(value, 5, 18)
        ],
        phoneNumber: [
            (value) => validators.phoneVN(value)
        ],
        parentPhone1: [
            (value) => validators.phoneVN(value)
        ],
        parentPhone2: [
            (value) => validators.phoneVN(value)
        ],
        attendanceScore: [
            (value) => validators.number(value, 0, 10)
        ],
        studyScore: [
            (value) => validators.number(value, 0, 10)
        ]
    },

    // Class creation/update
    class: {
        name: [
            (value) => validators.required(value, 'Tên lớp'),
            (value) => validators.length(value, 2, 50)
        ],
        departmentId: [
            (value) => validators.required(value, 'Ngành'),
            (value) => validators.number(value, 1)
        ]
    },

    // Change password
    changePassword: {
        currentPassword: [
            (value) => validators.required(value, 'Mật khẩu hiện tại')
        ],
        newPassword: [
            (value) => validators.required(value, 'Mật khẩu mới'),
            (value) => validators.strongPassword(value)
        ],
        confirmNewPassword: [
            (value) => validators.required(value, 'Xác nhận mật khẩu mới'),
            (value, formData) => validators.confirmPassword(value, formData.newPassword)
        ]
    }
};

// Form validation hook
import { useState, useCallback } from 'react';

export const useFormValidation = (schema, initialValues = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validate single field
    const validateField = useCallback((fieldName, value, allValues = values) => {
        const fieldValidators = schema[fieldName];
        if (!fieldValidators) return null;

        for (const validator of fieldValidators) {
            const error = validator(value, allValues);
            if (error) return error;
        }
        return null;
    }, [schema, values]);

    // Validate all fields
    const validateAll = useCallback((valuesToValidate = values) => {
        const newErrors = {};
        let hasErrors = false;

        Object.keys(schema).forEach(fieldName => {
            const error = validateField(fieldName, valuesToValidate[fieldName], valuesToValidate);
            if (error) {
                newErrors[fieldName] = error;
                hasErrors = true;
            }
        });

        setErrors(newErrors);
        return !hasErrors;
    }, [schema, validateField, values]);

    // Handle field change
    const handleChange = useCallback((fieldName, value) => {
        setValues(prev => ({ ...prev, [fieldName]: value }));

        // Validate field if it was touched
        if (touched[fieldName]) {
            const error = validateField(fieldName, value);
            setErrors(prev => ({ ...prev, [fieldName]: error }));
        }
    }, [touched, validateField]);

    // Handle field blur
    const handleBlur = useCallback((fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));

        const error = validateField(fieldName, values[fieldName]);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
    }, [validateField, values]);

    // Handle form submission
    const handleSubmit = useCallback(async (onSubmit) => {
        setIsSubmitting(true);

        // Mark all fields as touched
        const allTouched = Object.keys(schema).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        // Validate all fields
        const isValid = validateAll();

        if (isValid) {
            try {
                await onSubmit(values);
            } catch (error) {
                console.error('Form submission error:', error);
                throw error;
            }
        }

        setIsSubmitting(false);
        return isValid;
    }, [schema, validateAll, values]);

    // Reset form
    const reset = useCallback((newValues = initialValues) => {
        setValues(newValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    // Get field props for easy binding
    const getFieldProps = useCallback((fieldName) => ({
        value: values[fieldName] || '',
        onChange: (e) => handleChange(fieldName, e.target.value),
        onBlur: () => handleBlur(fieldName),
        error: touched[fieldName] ? errors[fieldName] : null
    }), [values, handleChange, handleBlur, touched, errors]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        validateField,
        validateAll,
        reset,
        getFieldProps,
        isValid: Object.keys(errors).length === 0
    };
};

// Reusable FormField component
import React from 'react';

export const FormField = ({
    label,
    name,
    type = 'text',
    required = false,
    placeholder,
    error,
    value,
    onChange,
    onBlur,
    options = [], // For select fields
    className = '',
    helpText,
    ...props
}) => {
    const baseInputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`;

    const renderInput = () => {
        switch (type) {
            case 'select':
                return (
                    <select
                        name={name}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={baseInputClasses}
                        {...props}
                    >
                        {placeholder && <option value="">{placeholder}</option>}
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'textarea':
                return (
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        className={baseInputClasses}
                        rows={3}
                        {...props}
                    />
                );

            default:
                return (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        className={baseInputClasses}
                        {...props}
                    />
                );
        }
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            {renderInput()}
            {helpText && !error && (
                <p className="text-xs text-gray-500 mt-1">{helpText}</p>
            )}
            {error && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span> {error}
                </p>
            )}
        </div>
    );
};

export default { validators, validationSchemas, useFormValidation, FormField };