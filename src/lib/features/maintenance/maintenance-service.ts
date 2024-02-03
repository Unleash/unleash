import memoizee from 'memoizee';
import { IUnleashConfig } from '../../types';
import { Logger } from '../../logger';
import SettingService from '../../services/setting-service';
import { maintenanceSettingsKey } from '../../types/settings/maintenance-settings';
import { MaintenanceSchema } from '../../openapi/spec/maintenance-schema';
import { minutesToMilliseconds } from 'date-fns';

export interface IMaintenanceStatus {
    isMaintenanceMode(): Promise<boolean>;
}

export default class MaintenanceService implements IMaintenanceStatus {
    private config: IUnleashConfig;

    private logger: Logger;

    private settingService: SettingService;

    private resolveMaintenance: () => Promise<boolean>;

    constructor(config: IUnleashConfig, settingService: SettingService) {
        this.config = config;
        this.logger = config.getLogger('services/maintenance-service.ts');
        this.settingService = settingService;
        this.resolveMaintenance = memoizee(
            async () => (await this.getMaintenanceSetting()).enabled,
            {
                promise: true,
                maxAge: minutesToMilliseconds(1),
            },
        );
    }

    async isMaintenanceMode(): Promise<boolean> {
        try {
            return (
                this.config.flagResolver.isEnabled('maintenanceMode') ||
                (await this.resolveMaintenance())
            );
        } catch (e) {
            this.logger.warn('Error checking maintenance mode', e);
            return false;
        }
    }

    async getMaintenanceSetting(): Promise<MaintenanceSchema> {
        this.logger.debug('getMaintenanceSetting called');
        return this.settingService.getWithDefault(maintenanceSettingsKey, {
            enabled: false,
        });
    }

    async toggleMaintenanceMode(
        setting: MaintenanceSchema,
        user: string,
        toggledByUserId: number,
    ): Promise<void> {
        //@ts-ignore
        this.resolveMaintenance.clear();
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
