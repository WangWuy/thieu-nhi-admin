import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet } from 'lucide-react';
import importService from '../../services/importService';

const ExcelImportModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;
        
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        
        if (!validTypes.includes(selectedFile.type)) {
            setError('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
            return;
        }
        
        setFile(selectedFile);
        setError('');
    };

    const handleImport = async () => {
        if (!file) return;
        
        try {
            setLoading(true);
            const result = await importService.importStudentsFromExcel(file);
            
            // Xử lý response đúng format từ backend
            const successCount = result.results?.success?.length || 0;
            const failedCount = result.results?.failed?.length || 0;
            
            alert(`Import thành công ${successCount} thiếu nhi! ${failedCount > 0 ? `${failedCount} lỗi.` : ''}`);
            
            if (successCount > 0) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">Import thiếu nhi</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-input"
                        />
                        <label
                            htmlFor="file-input"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                        >
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Chọn file Excel
                        </label>
                        
                        {file && (
                            <div className="mt-3 text-sm text-green-600">
                                ✓ {file.name}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm">{error}</div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
                    >
                        {loading ? 'Đang import...' : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExcelImportModal;