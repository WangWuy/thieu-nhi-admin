import React from 'react';

// Base Skeleton component
const Skeleton = ({ className = '', variant = 'rectangular', ...props }) => {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-red-100 via-red-200 to-red-100 bg-[length:200%_100%]';

    const variantClasses = {
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4',
        avatar: 'rounded-full w-10 h-10',
        card: 'rounded-xl'
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{
                animation: 'shimmer 2s infinite linear'
            }}
            {...props}
        />
    );
};

// Dashboard Skeleton
export const DashboardSkeleton = () => (
    <div className="space-y-6">
        {/* Welcome Card Skeleton */}
        <Skeleton className="h-20 w-full" variant="card" />

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-red-100">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-16" variant="text" />
                            <Skeleton className="h-8 w-12" variant="text" />
                            <Skeleton className="h-3 w-20" variant="text" />
                        </div>
                        <Skeleton className="w-8 h-8" variant="circular" />
                    </div>
                </div>
            ))}
        </div>

        {/* Department Stats Skeleton */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-red-100">
            <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-5 h-5" variant="circular" />
                <Skeleton className="h-6 w-32" variant="text" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="border border-red-100 rounded-lg p-4">
                        <Skeleton className="h-5 w-16 mb-3" variant="text" />
                        <div className="space-y-2">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="flex justify-between">
                                    <Skeleton className="h-4 w-10" variant="text" />
                                    <Skeleton className="h-4 w-6" variant="text" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
    <div className="bg-white rounded-lg shadow-sm border border-red-100">
        {/* Table Header */}
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
            <div className="grid grid-cols-6 gap-4">
                {[...Array(columns)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" variant="text" />
                ))}
            </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-red-100">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                    <div className="grid grid-cols-6 gap-4 items-center">
                        {/* First column - User info */}
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10" variant="circular" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-24" variant="text" />
                                <Skeleton className="h-3 w-16" variant="text" />
                            </div>
                        </div>

                        {/* Other columns */}
                        {[...Array(columns - 1)].map((_, j) => (
                            <Skeleton key={j} className="h-4 w-full" variant="text" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Card Grid Skeleton (for classes, etc.)
export const CardGridSkeleton = ({ items = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(items)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-red-100">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12" variant="circular" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-20" variant="text" />
                            <Skeleton className="h-4 w-16" variant="text" />
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Skeleton className="w-6 h-6" variant="circular" />
                        <Skeleton className="w-6 h-6" variant="circular" />
                    </div>
                </div>

                {/* Teachers section */}
                <div className="mb-4">
                    <Skeleton className="h-4 w-16 mb-2" variant="text" />
                    <div className="space-y-2">
                        {[...Array(2)].map((_, j) => (
                            <div key={j} className="flex items-center gap-2">
                                <Skeleton className="w-2 h-2" variant="circular" />
                                <Skeleton className="h-3 w-24" variant="text" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-red-100">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4" variant="circular" />
                        <Skeleton className="h-4 w-16" variant="text" />
                    </div>
                    <Skeleton className="h-4 w-12" variant="text" />
                </div>
            </div>
        ))}
    </div>
);

// Form Skeleton
export const FormSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" variant="text" />
                    <Skeleton className="h-10 w-full" variant="rectangular" />
                </div>
            ))}
        </div>

        <div className="space-y-2">
            <Skeleton className="h-4 w-16" variant="text" />
            <Skeleton className="h-24 w-full" variant="rectangular" />
        </div>

        <div className="flex gap-3 justify-end">
            <Skeleton className="h-10 w-20" variant="rectangular" />
            <Skeleton className="h-10 w-24" variant="rectangular" />
        </div>
    </div>
);

// List Item Skeleton
export const ListItemSkeleton = () => (
    <div className="p-4 hover:bg-red-50 border-b border-red-100">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10" variant="circular" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" variant="text" />
                    <Skeleton className="h-3 w-20" variant="text" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="space-y-1">
                    <Skeleton className="h-6 w-16" variant="rectangular" />
                    <Skeleton className="h-6 w-16" variant="rectangular" />
                </div>
                <Skeleton className="h-8 w-24" variant="rectangular" />
            </div>
        </div>
    </div>
);

// Attendance Page Skeleton
export const AttendanceSkeleton = () => (
    <div className="space-y-6">
        {/* Filters Skeleton */}
        <div className="bg-gradient-to-r from-red-50 to-amber-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-16" variant="text" />
                        <Skeleton className="h-10 w-full" variant="rectangular" />
                    </div>
                ))}
            </div>
        </div>

        {/* Stats Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="text-center p-4 rounded-lg border">
                            <Skeleton className="h-8 w-12 mx-auto mb-2" variant="text" />
                            <Skeleton className="h-4 w-16" variant="text" />
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-24" variant="rectangular" />
                    ))}
                </div>
            </div>
        </div>

        {/* Student List Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-red-100">
            <div className="p-4 border-b border-red-100">
                <Skeleton className="h-6 w-48" variant="text" />
                <Skeleton className="h-4 w-32 mt-1" variant="text" />
            </div>
            <div className="divide-y divide-red-100">
                {[...Array(8)].map((_, i) => (
                    <ListItemSkeleton key={i} />
                ))}
            </div>
        </div>
    </div>
);

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', color = 'red' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    const colorClasses = {
        red: 'border-red-600',
        blue: 'border-blue-600',
        green: 'border-green-600',
        yellow: 'border-yellow-600'
    };

    return (
        <div className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`} />
    );
};

// Full Page Loading
export const FullPageLoading = ({ message = 'Đang tải...' }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <LoadingSpinner size="xl" color="red" />
            <p className="text-red-600 mt-4 font-medium">{message}</p>
        </div>
    </div>
);

// Button Loading State
export const LoadingButton = ({
    loading = false,
    children,
    className = '',
    disabled = false,
    loadingText = 'Đang xử lý...',
    ...props
}) => (
    <button
        className={`${className} ${loading || disabled ? 'opacity-75 cursor-not-allowed' : ''}`}
        disabled={loading || disabled}
        {...props}
    >
        {loading ? (
            <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" color="white" />
                {loadingText}
            </div>
        ) : (
            children
        )}
    </button>
);

// Lazy Loading Wrapper
export const LazyLoader = ({
    isLoading,
    error,
    skeleton,
    children,
    errorComponent,
    retryButton = true,
    onRetry
}) => {
    if (error) {
        return errorComponent || (
            <div className="text-center py-12 bg-white rounded-lg border border-red-100">
                <div className="text-red-500 mb-4">⚠️ {error}</div>
                {retryButton && onRetry && (
                    <button
                        onClick={onRetry}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                        Thử lại
                    </button>
                )}
            </div>
        );
    }

    if (isLoading) {
        return skeleton;
    }

    return children;
};

// Progressive Loading Hook
export const useProgressiveLoading = (totalSteps = 1) => {
    const [currentStep, setCurrentStep] = React.useState(0);
    const [isComplete, setIsComplete] = React.useState(false);

    const nextStep = () => {
        setCurrentStep(prev => {
            const next = Math.min(prev + 1, totalSteps);
            if (next === totalSteps) {
                setIsComplete(true);
            }
            return next;
        });
    };

    const reset = () => {
        setCurrentStep(0);
        setIsComplete(false);
    };

    const progress = (currentStep / totalSteps) * 100;

    return {
        currentStep,
        totalSteps,
        isComplete,
        progress,
        nextStep,
        reset
    };
};

// Progress Bar Component
export const ProgressBar = ({ progress = 0, className = '', animated = true }) => (
    <div className={`w-full bg-red-100 rounded-full h-2 ${className}`}>
        <div
            className={`bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300 ${animated ? 'ease-out' : ''
                }`}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
    </div>
);

// Global Loading Context
export const LoadingContext = React.createContext({
    isLoading: false,
    setLoading: () => { },
    loadingMessage: ''
});

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState('');

    const setLoading = (loading, message = 'Đang tải...') => {
        setIsLoading(loading);
        setLoadingMessage(message);
    };

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading, loadingMessage }}>
            {children}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-xl">
                        <div className="flex items-center gap-3">
                            <LoadingSpinner size="md" color="red" />
                            <span className="text-gray-700">{loadingMessage}</span>
                        </div>
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
};

// Custom CSS for shimmer animation
const shimmerCSS = `
@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}
`;

// Inject CSS if not already present
if (typeof document !== 'undefined' && !document.getElementById('skeleton-shimmer-styles')) {
    const style = document.createElement('style');
    style.id = 'skeleton-shimmer-styles';
    style.textContent = shimmerCSS;
    document.head.appendChild(style);
}

export default Skeleton;