import React, { useEffect, useRef, useState, useCallback } from 'react';

// Screen Reader Only component
export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => (
    <Component className="sr-only">
        {children}
    </Component>
);

// Skip to main content link
export const SkipToMain = ({ targetId = 'main-content' }) => (
    <a
        href={`#${targetId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-red-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById(targetId);
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }}
    >
        Chuyển đến nội dung chính
    </a>
);

// Accessible Button component
export const AccessibleButton = ({
    children,
    onClick,
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'md',
    className = '',
    ariaLabel,
    ariaDescribedBy,
    type = 'button',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-busy={loading}
            {...props}
        >
            {loading && (
                <>
                    <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                    </svg>
                    <ScreenReaderOnly>Đang xử lý</ScreenReaderOnly>
                </>
            )}
            {children}
        </button>
    );
};

// Accessible Modal component
export const AccessibleModal = ({
    isOpen,
    onClose,
    title,
    children,
    className = '',
    size = 'md',
    closeOnEscape = true,
    closeOnOverlayClick = true
}) => {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    // Focus management
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;

            // Focus modal after a brief delay
            setTimeout(() => {
                if (modalRef.current) {
                    modalRef.current.focus();
                }
            }, 100);
        } else {
            // Return focus to previous element
            if (previousFocusRef.current) {
                previousFocusRef.current.focus();
            }
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && closeOnEscape) {
                onClose();
                return;
            }

            // Trap focus within modal
            if (e.key === 'Tab') {
                const modal = modalRef.current;
                if (!modal) return;

                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement?.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement?.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, closeOnEscape]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={closeOnOverlayClick ? onClose : undefined}
        >
            <div
                ref={modalRef}
                className={`bg-white rounded-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto ${className}`}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
                        aria-label="Đóng modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Accessible Form Input
export const AccessibleInput = ({
    label,
    id,
    error,
    helpText,
    required = false,
    type = 'text',
    className = '',
    ...props
}) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;

    return (
        <div className={className}>
            <label
                htmlFor={inputId}
                className="block text-sm font-medium text-gray-700 mb-2"
            >
                {label}
                {required && (
                    <span className="text-red-500 ml-1" aria-label="bắt buộc">*</span>
                )}
            </label>

            <input
                id={inputId}
                type={type}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
                aria-invalid={error ? 'true' : 'false'}
                required={required}
                {...props}
            />

            {helpText && (
                <p id={helpId} className="text-xs text-gray-500 mt-1">
                    {helpText}
                </p>
            )}

            {error && (
                <p id={errorId} className="text-xs text-red-600 mt-1" role="alert">
                    <span aria-hidden="true">⚠️</span> {error}
                </p>
            )}
        </div>
    );
};

// Accessible Table
export const AccessibleTable = ({
    data,
    columns,
    caption,
    className = '',
    sortable = false,
    onSort,
    sortKey,
    sortDirection
}) => {
    return (
        <div className="overflow-x-auto">
            <table className={`w-full ${className}`} role="table">
                {caption && (
                    <caption className="text-left text-sm text-gray-700 mb-4 font-medium">
                        {caption}
                    </caption>
                )}

                <thead className="bg-red-50 border-b border-red-200">
                    <tr role="row">
                        {columns.map((column, index) => (
                            <th
                                key={column.key || index}
                                className={`px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500' : ''}`}
                                role="columnheader"
                                scope="col"
                                tabIndex={sortable ? 0 : undefined}
                                onClick={sortable && onSort ? () => onSort(column.key) : undefined}
                                onKeyDown={sortable && onSort ? (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onSort(column.key);
                                    }
                                } : undefined}
                                aria-sort={
                                    sortable && sortKey === column.key
                                        ? sortDirection === 'asc' ? 'ascending' : 'descending'
                                        : sortable ? 'none' : undefined
                                }
                            >
                                <div className="flex items-center gap-1">
                                    {column.label}
                                    {sortable && (
                                        <span aria-hidden="true">
                                            {sortKey === column.key ? (
                                                sortDirection === 'asc' ? '↑' : '↓'
                                            ) : '↕'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-red-100">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} role="row" className="hover:bg-red-50">
                            {columns.map((column, colIndex) => (
                                <td
                                    key={`${rowIndex}-${colIndex}`}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    role="cell"
                                >
                                    {column.render ? column.render(row, rowIndex) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {data.length === 0 && (
                <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
                    Không có dữ liệu để hiển thị
                </div>
            )}
        </div>
    );
};

// Live Region for dynamic announcements
export const LiveRegion = ({ message, level = 'polite', clearAfter = 5000 }) => {
    const [currentMessage, setCurrentMessage] = useState(message);

    useEffect(() => {
        setCurrentMessage(message);

        if (message && clearAfter > 0) {
            const timer = setTimeout(() => {
                setCurrentMessage('');
            }, clearAfter);

            return () => clearTimeout(timer);
        }
    }, [message, clearAfter]);

    return (
        <div
            aria-live={level}
            aria-atomic="true"
            className="sr-only"
        >
            {currentMessage}
        </div>
    );
};

// Focus management hook
export const useFocusManagement = () => {
    const [focusTrap, setFocusTrap] = useState(null);

    const trapFocus = useCallback((element) => {
        if (!element) return;

        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement?.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement?.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        element.addEventListener('keydown', handleKeyDown);
        setFocusTrap(() => () => {
            element.removeEventListener('keydown', handleKeyDown);
        });

        // Focus first element
        firstElement?.focus();
    }, []);

    const releaseFocus = useCallback(() => {
        if (focusTrap) {
            focusTrap();
            setFocusTrap(null);
        }
    }, [focusTrap]);

    return { trapFocus, releaseFocus };
};

// Keyboard navigation hook
export const useKeyboardNavigation = (items, onSelect) => {
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < items.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : items.length - 1
                );
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    onSelect(items[selectedIndex]);
                }
                break;
            case 'Escape':
                setSelectedIndex(-1);
                break;
        }
    }, [items, selectedIndex, onSelect]);

    return {
        selectedIndex,
        setSelectedIndex,
        handleKeyDown
    };
};

// Color contrast utilities
export const getContrastRatio = (color1, color2) => {
    const getLuminance = (color) => {
        const rgb = color.match(/\d+/g).map(Number);
        const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);

    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

export const meetsWCAGAA = (color1, color2) => getContrastRatio(color1, color2) >= 4.5;
export const meetsWCAGAAA = (color1, color2) => getContrastRatio(color1, color2) >= 7;

export default {
    ScreenReaderOnly,
    SkipToMain,
    AccessibleButton,
    AccessibleModal,
    AccessibleInput,
    AccessibleTable,
    LiveRegion,
    useFocusManagement,
    useKeyboardNavigation,
    getContrastRatio,
    meetsWCAGAA,
    meetsWCAGAAA
};