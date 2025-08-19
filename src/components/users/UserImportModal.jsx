import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import importService from '../../services/importService';

const UserImportModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);

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
            setProgress(0);
            
            const result = await importService.importUsersFromExcel(file, (progressValue) => {
                setProgress(progressValue);
            });
            
            // Xử lý response từ backend
            const successCount = result.results?.success?.length || 0;
            const failedCount = result.results?.failed?.length || 0;
            
            if (successCount > 0) {
                alert(`Import thành công ${successCount} người dùng! ${failedCount > 0 ? `${failedCount} lỗi.` : ''}\nMật khẩu mặc định: ${result.defaultPassword || '123456'}`);
                onSuccess();
                onClose();
            } else {
                setError('Không có người dùng nào được import thành công');
            }
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            await importService.downloadTemplate('user');
        } catch (err) {
            setError('Không thể tải template: ' + err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-red-800">Import Người Dùng</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* File upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="user-file-input"
                        />
                        <label
                            htmlFor="user-file-input"
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700"
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

                    {/* Progress bar */}
                    {loading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Đang import...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Format info */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-amber-800 mb-1">Lưu ý:</p>
                                <ul className="text-amber-700 space-y-1 text-xs">
                                    <li>• Headers ở dòng 3, data từ dòng 4</li>
                                    <li>• Số điện thoại sẽ làm username</li>
                                    <li>• Mật khẩu mặc định: 123456</li>
                                    <li>• Phân đoàn: CHIÊN, ẤU, THIẾU, NGHĨA</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg"
                    >
                        {loading ? 'Đang import...' : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserImportModal;