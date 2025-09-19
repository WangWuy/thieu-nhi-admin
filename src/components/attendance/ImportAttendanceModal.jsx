import { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { getAttendanceTypeName } from '../../utils/helpers';

const ImportAttendanceModal = ({ 
    isOpen, 
    onClose, 
    filters, 
    onImportSuccess 
}) => {
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    if (!isOpen) return null;

    const handleFileSelect = (file) => {
        if (!file) return;
        
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
            return;
        }
        
        setImportFile(file);
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        handleFileSelect(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragOver(false);
        
        const file = event.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleImport = async () => {
        if (!importFile || !filters.date || !filters.type) {
            alert('Vui lòng chọn file và thiết lập ngày + buổi điểm danh');
            return;
        }

        try {
            setImporting(true);
            
            const formData = new FormData();
            formData.append('file', importFile);
            formData.append('attendanceDate', filters.date);
            formData.append('attendanceType', filters.type);

            const result = await attendanceService.importAttendance(formData);
            
            alert(result.message || 'Import thành công!');
            
            // Reset và đóng modal
            handleClose();
            
            // Callback để refresh data
            if (onImportSuccess) {
                onImportSuccess();
            }
            
        } catch (err) {
            alert('Lỗi import: ' + err.message);
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        setImportFile(null);
        setImporting(false);
        setDragOver(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-0 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-lg bg-white">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Import Điểm Danh từ Excel</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    
                    {/* Current Settings */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Thiết lập hiện tại
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-blue-600 font-medium">Ngày:</span> 
                                <span className="ml-2">{new Date(filters.date).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div>
                                <span className="text-blue-600 font-medium">Buổi:</span> 
                                <span className="ml-2">{getAttendanceTypeName(filters.type)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-800 mb-2">Hướng dẫn:</h4>
                        <div className="text-sm text-yellow-700 space-y-1">
                            <div>• File Excel chỉ cần 1 cột chứa mã thiếu nhi</div>
                            <div>• Mỗi dòng = 1 mã thiếu nhi có mặt</div>
                            <div>• Chỉ đánh dấu có mặt, không thay đổi trạng thái hiện tại của những thiếu nhi khác</div>
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Chọn file Excel
                        </label>
                        
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                dragOver 
                                    ? 'border-blue-400 bg-blue-50' 
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileInputChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            
                            <div className="space-y-4">
                                <Upload className="mx-auto h-16 w-16 text-gray-400" />
                                <div>
                                    <p className="text-lg text-gray-600 mb-1">
                                        <span className="font-medium text-blue-600">Kéo thả file vào đây</span> hoặc click để chọn
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Chỉ hỗ trợ file .xlsx và .xls
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Selected File Info */}
                        {importFile && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                <FileText className="w-6 h-6 text-green-600" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-green-800">{importFile.name}</div>
                                    <div className="text-xs text-green-600">
                                        {(importFile.size / 1024).toFixed(1)} KB - Sẵn sàng import
                                    </div>
                                </div>
                                <button
                                    onClick={() => setImportFile(null)}
                                    className="text-green-600 hover:text-green-800"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={handleClose}
                        disabled={importing}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    
                    <button
                        onClick={handleImport}
                        disabled={importing || !importFile}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {importing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang import...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Xác nhận Import
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportAttendanceModal;