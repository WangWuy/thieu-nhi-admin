import apiService from './api.js';

export const backupService = {
    async downloadExcelBackup() {
        return apiService.download('/backup/excel', 'system-backup.xlsx');
    },

    async downloadDbDump() {
        return apiService.download('/backup/dump', 'system-backup.dump');
    }
};

export default backupService;
