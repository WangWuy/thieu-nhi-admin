import { useEffect, useState } from 'react';
import { Shield, Database, Download } from 'lucide-react';
import { backupService } from '../../services/backupService';

const SystemSettingsSection = () => {
    const [downloadingExcel, setDownloadingExcel] = useState(false);
    const [downloadingDump, setDownloadingDump] = useState(false);
    const [lastBackupTime, setLastBackupTime] = useState(() => {
        const stored = localStorage.getItem('lastBackupTime');
        return stored ? new Date(stored) : null;
    });

    useEffect(() => {
        if (lastBackupTime) {
            localStorage.setItem('lastBackupTime', lastBackupTime.toISOString());
        }
    }, [lastBackupTime]);

    const updateLastBackup = () => setLastBackupTime(new Date());

    const formatLastBackup = () => {
        if (!lastBackupTime) return 'Chưa có dữ liệu';

        return lastBackupTime.toLocaleString('vi-VN', {
            hour12: false,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadExcel = async () => {
        try {
            setDownloadingExcel(true);
            await backupService.downloadExcelBackup();
            updateLastBackup();
        } catch (error) {
            alert(error.message || 'Tải sao lưu Excel thất bại');
        } finally {
            setDownloadingExcel(false);
        }
    };

    const handleDownloadDump = async () => {
        try {
            setDownloadingDump(true);
            await backupService.downloadDbDump();
            updateLastBackup();
        } catch (error) {
            alert(error.message || 'Tải sao lưu dump thất bại');
        } finally {
            setDownloadingDump(false);
        }
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4 text-red-800">Cài đặt hệ thống</h2>
            <div className="space-y-6">
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-red-600" />
                        <h3 className="font-medium text-red-800">Bảo mật</h3>
                    </div>
                    <p className="text-red-700 text-sm">
                        Hệ thống đang chạy ở chế độ an toàn. Tất cả dữ liệu được mã hóa.
                    </p>
                </div>

                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-green-600" />
                        <h3 className="font-medium text-green-800">Sao lưu dữ liệu</h3>
                    </div>
                    <p className="text-green-700 text-sm mb-3">Lần sao lưu cuối: {formatLastBackup()}</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleDownloadExcel}
                            disabled={downloadingExcel}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            {downloadingExcel ? 'Đang tải...' : 'Tải Excel'}
                        </button>
                        <button
                            onClick={handleDownloadDump}
                            disabled={downloadingDump}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            {downloadingDump ? 'Đang tải...' : 'Tải dump DB'}
                        </button>
                        <div className="basis-full text-xs text-gray-600 mt-1 space-y-1">
                            <div>Tên file Excel: system-backup.xlsx</div>
                            <div>Tên file dump: system-backup.dump</div>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-red-600">
                    <p><strong>Phiên bản:</strong> {import.meta.env.VITE_APP_VERSION || 'v1.0.0'}</p>
                    <p><strong>Cập nhật cuối:</strong> 22/09/2025</p>
                </div>
            </div>
        </div>
    );
};

export default SystemSettingsSection;
