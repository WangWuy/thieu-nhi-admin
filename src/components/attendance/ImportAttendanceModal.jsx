import { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
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
    const [importPreview, setImportPreview] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    if (!isOpen) return null;

    const handleFileSelect = async (file) => {
        if (!file) return;

        setImportFile(file);
        
        // Preview file
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const preview = await attendanceService.previewAttendance(formData);
            setImportPreview(preview);
        } catch (err) {
            alert('Lỗi preview file: ' + err.message);
            setImportFile(null);
        }
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        handleFileSelect(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragOver(false);
        
        const file = event.dataTransfer.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            handleFileSelect(file);
        } else {
            alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleImport = async (markAbsentForMissing = false) => {
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
            formData.append('markAbsentForMissing', markAbsentForMissing);

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
        setImportPreview(null);
        setImporting(false);
        setDragOver(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-0 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-hidden">
                
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
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    
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
                        <div className="mt-2 text-xs text-blue-600">
                            File Excel sẽ được import cho ngày và buổi này
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Chọn file Excel
                        </label>
                        
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                            
                            <div className="space-y-3">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium text-blue-600">Kéo thả file vào đây</span> hoặc click để chọn
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Chỉ hỗ trợ file .xlsx và .xls
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Selected File Info */}
                        {importFile && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                <FileText className="w-5 h-5 text-green-600" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-green-800">{importFile.name}</div>
                                    <div className="text-xs text-green-600">
                                        {(importFile.size / 1024).toFixed(1)} KB
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setImportFile(null);
                                        setImportPreview(null);
                                    }}
                                    className="text-green-600 hover:text-green-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {importPreview && (
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Preview File
                            </h4>
                            
                            <div className="bg-gray-50 rounded-lg p-4 border">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                    <div>
                                        <span className="text-gray-600">Tên file:</span>
                                        <div className="font-medium">{importPreview.fileName}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Header row:</span>
                                        <div className="font-medium">{importPreview.structure?.headerRow}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Cột mã TN:</span>
                                        <div className="font-medium">{importPreview.structure?.studentCodeColumn}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Tổng dòng:</span>
                                        <div className="font-medium">{importPreview.structure?.totalRows}</div>
                                    </div>
                                </div>

                                {/* Preview data */}
                                {importPreview.preview && importPreview.preview.length > 0 && (
                                    <div>
                                        <div className="text-sm text-gray-600 mb-2">Preview 10 dòng đầu:</div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-xs">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="px-3 py-2 text-left">Dòng</th>
                                                        <th className="px-3 py-2 text-left">Mã TN</th>
                                                        <th className="px-3 py-2 text-left">Hiểu thành</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {importPreview.preview.map((item, index) => (
                                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="px-3 py-2">{item.row}</td>
                                                            <td className="px-3 py-2 font-mono">{item.studentCode}</td>
                                                            <td className="px-3 py-2">
                                                                <span className={`px-2 py-1 rounded text-xs ${
                                                                    item.interpretedAs === 'Có mặt' 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {item.interpretedAs}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Import Options */}
                    {importFile && (
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-800 mb-3">Tùy chọn import</h4>
                            <div className="space-y-3">
                                <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                                    <div className="text-sm font-medium text-blue-800 mb-1">
                                        Logic import:
                                    </div>
                                    <div className="text-xs text-blue-600">
                                        • Thiếu nhi có mã TN trong file Excel → Đánh dấu <strong>CÓ MẶT</strong><br/>
                                        • Thiếu nhi không có mã TN trong file → Có thể tự động đánh <strong>VẮNG</strong> (tùy chọn)
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
                    
                    {importFile && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleImport(false)}
                                disabled={importing}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {importing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                Import (Chỉ có mặt)
                            </button>
                            
                            <button
                                onClick={() => handleImport(true)}
                                disabled={importing}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {importing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                Import + Đánh vắng
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportAttendanceModal;