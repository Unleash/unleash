import { IUnleashConfig } from '../../types';
import { Logger } from '../../logger';
import SettingService from '../../services/setting-service';
import { maintenanceSettingsKey } from '../../types/settings/maintenance-settings';
import { MaintenanceSchema } from '../../openapi/spec/maintenance-schema';

export interface IMaintenanceStatus {
    isMaintenanceMode(): Promise<boolean>;
}

export default class MaintenanceService implements IMaintenanceStatus {
    private config: IUnleashConfig;

    private logger: Logger;

    private settingService: SettingService;

    constructor(config: IUnleashConfig, settingService: SettingService) {
        this.config = config;
        this.logger = config.getLogger('services/pat-service.ts');
        this.settingService = settingService;
    }

    async isMaintenanceMode(): Promise<boolean> {
        return (
            this.config.flagResolver.isEnabled('maintenanceMode') ||
            (await this.getMaintenanceSetting()).enabled
        );
    }

    async getMaintenanceSetting(): Promise<MaintenanceSchema> {
        return (
            (await this.settingService.get(maintenanceSettingsKey)) || {
                enabled: false,
            }
        );
    }

    async toggleMaintenanceMode(
        setting: MaintenanceSchema,
        user: string,
        toggledByUserId: number,
    ): Promise<void> {
        return this.settingService.insert(
            maintenanceSettingsKey,
            setting,
            user,
            toggledByUserId,
            false,
        );
    }
}

module.exports = MaintenanceService;
