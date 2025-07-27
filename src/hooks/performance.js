import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Debounce hook for search inputs
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Throttle hook for scroll events
export const useThrottle = (value, delay = 100) => {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastRun = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRun.current >= delay) {
                setThrottledValue(value);
                lastRun.current = Date.now();
            }
        }, delay - (Date.now() - lastRun.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return throttledValue;
};

// Memoized search hook
export const useSearch = (items, searchTerm, searchFields, options = {}) => {
    const {
        caseSensitive = false,
        exactMatch = false,
        threshold = 0.6 // For fuzzy search
    } = options;

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredItems = useMemo(() => {
        if (!debouncedSearchTerm.trim()) return items;

        const term = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase();

        return items.filter(item => {
            return searchFields.some(field => {
                const value = getNestedValue(item, field);
                if (!value) return false;

                const searchValue = caseSensitive ? value.toString() : value.toString().toLowerCase();

                if (exactMatch) {
                    return searchValue === term;
                }

                // Simple includes search (can be enhanced with fuzzy search)
                return searchValue.includes(term);
            });
        });
    }, [items, debouncedSearchTerm, searchFields, caseSensitive, exactMatch]);

    return filteredItems;
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((value, key) => value?.[key], obj);
};

// Memoized pagination hook
export const usePagination = (items, pageSize = 20) => {
    const [currentPage, setCurrentPage] = useState(1);

    const paginationData = useMemo(() => {
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const currentItems = items.slice(startIndex, endIndex);

        return {
            currentItems,
            currentPage,
            totalPages,
            totalItems,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            startIndex: startIndex + 1,
            endIndex: Math.min(endIndex, totalItems)
        };
    }, [items, currentPage, pageSize]);

    const goToPage = useCallback((page) => {
        setCurrentPage(Math.max(1, Math.min(page, paginationData.totalPages)));
    }, [paginationData.totalPages]);

    const nextPage = useCallback(() => {
        goToPage(currentPage + 1);
    }, [currentPage, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(currentPage - 1);
    }, [currentPage, goToPage]);

    // Reset page when items change
    useEffect(() => {
        setCurrentPage(1);
    }, [items.length]);

    return {
        ...paginationData,
        goToPage,
        nextPage,
        prevPage,
        setCurrentPage
    };
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = ({
    items,
    itemHeight,
    containerHeight,
    overscan = 5
}) => {
    const [scrollTop, setScrollTop] = useState(0);

    const visibleItems = useMemo(() => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
            items.length
        );
        const actualStartIndex = Math.max(0, startIndex - overscan);

        return {
            items: items.slice(actualStartIndex, endIndex),
            startIndex: actualStartIndex,
            endIndex,
            totalHeight: items.length * itemHeight,
            offsetY: actualStartIndex * itemHeight
        };
    }, [items, itemHeight, containerHeight, scrollTop, overscan]);

    const handleScroll = useCallback((e) => {
        setScrollTop(e.target.scrollTop);
    }, []);

    return {
        ...visibleItems,
        handleScroll
    };
};

// Optimized async data fetching hook
export const useAsyncData = (fetchFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);
    const abortControllerRef = useRef(null);

    const fetchData = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);

            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new AbortController
            abortControllerRef.current = new AbortController();

            const result = await fetchFunction(...args, {
                signal: abortControllerRef.current.signal
            });

            if (mountedRef.current) {
                setData(result);
                setError(null);
            }
        } catch (err) {
            if (mountedRef.current && err.name !== 'AbortError') {
                setError(err);
                setData(null);
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [fetchFunction]);

    // Auto-fetch on dependency change
    useEffect(() => {
        fetchData();
    }, dependencies);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch,
        fetchData
    };
};

// Optimized local storage hook
export const useLocalStorage = (key, initialValue) => {
    // Get initial value from localStorage
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Memoized setter function
    const setValue = useCallback((value) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Remove item from localStorage
    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
    const renderCount = useRef(0);
    const renderTimes = useRef([]);
    const startTime = useRef(performance.now());

    useEffect(() => {
        renderCount.current += 1;
        const endTime = performance.now();
        const renderTime = endTime - startTime.current;
        renderTimes.current.push(renderTime);

        // Keep only last 10 render times
        if (renderTimes.current.length > 10) {
            renderTimes.current.shift();
        }

        // Log performance if slow render
        if (renderTime > 16) { // Slower than 60fps
            console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }

        // Log stats every 10 renders
        if (renderCount.current % 10 === 0) {
            const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
            console.log(`${componentName} performance stats:`, {
                renders: renderCount.current,
                avgRenderTime: avgRenderTime.toFixed(2) + 'ms',
                lastRenderTime: renderTime.toFixed(2) + 'ms'
            });
        }

        startTime.current = performance.now();
    });

    return {
        renderCount: renderCount.current,
        avgRenderTime: renderTimes.current.length > 0
            ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
            : 0
    };
};

// Optimized intersection observer hook
export const useIntersectionObserver = (options = {}) => {
    const [entry, setEntry] = useState(null);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const elementRef = useRef(null);

    const {
        threshold = 0,
        rootMargin = '0px',
        root = null,
        freezeOnceVisible = false
    } = options;

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setEntry(entry);
                setIsIntersecting(entry.isIntersecting);

                // Freeze observer once visible
                if (freezeOnceVisible && entry.isIntersecting) {
                    observer.unobserve(element);
                }
            },
            { threshold, rootMargin, root }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, root, freezeOnceVisible]);

    return {
        elementRef,
        entry,
        isIntersecting
    };
};

// Memoized sort hook
export const useSort = (items, initialSortKey = null, initialSortDirection = 'asc') => {
    const [sortKey, setSortKey] = useState(initialSortKey);
    const [sortDirection, setSortDirection] = useState(initialSortDirection);

    const sortedItems = useMemo(() => {
        if (!sortKey) return items;

        return [...items].sort((a, b) => {
            const aValue = getNestedValue(a, sortKey);
            const bValue = getNestedValue(b, sortKey);

            // Handle null/undefined values
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
            if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

            // Handle different data types
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue, 'vi-VN', { numeric: true });
                return sortDirection === 'asc' ? comparison : -comparison;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [items, sortKey, sortDirection]);

    const handleSort = useCallback((key) => {
        if (sortKey === key) {
            // Toggle direction if same key
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            // New key, default to asc
            setSortKey(key);
            setSortDirection('asc');
        }
    }, [sortKey]);

    const resetSort = useCallback(() => {
        setSortKey(null);
        setSortDirection('asc');
    }, []);

    return {
        sortedItems,
        sortKey,
        sortDirection,
        handleSort,
        resetSort
    };
};

// Cache hook for expensive computations
export const useCache = (key, computeFunction, dependencies = []) => {
    const cache = useRef(new Map());

    return useMemo(() => {
        const cacheKey = `${key}-${JSON.stringify(dependencies)}`;

        if (cache.current.has(cacheKey)) {
            return cache.current.get(cacheKey);
        }

        const result = computeFunction();
        cache.current.set(cacheKey, result);

        // Limit cache size
        if (cache.current.size > 50) {
            const firstKey = cache.current.keys().next().value;
            cache.current.delete(firstKey);
        }

        return result;
    }, dependencies);
};

// Optimized window size hook
export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = useThrottle(() => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }, 100);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

// Export all hooks
export default {
    useDebounce,
    useThrottle,
    useSearch,
    usePagination,
    useVirtualScroll,
    useAsyncData,
    useLocalStorage,
    usePerformanceMonitor,
    useIntersectionObserver,
    useSort,
    useCache,
    useWindowSize
};