import memoizee from 'memoizee';
import type { IAuditUser, IUnleashConfig } from '../../types/index.js';
import type { Logger } from '../../logger.js';
import type SettingService from '../../services/setting-service.js';
import { maintenanceSettingsKey } from '../../types/settings/maintenance-settings.js';
import type { MaintenanceSchema } from '../../openapi/spec/maintenance-schema.js';
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
        return this.settingService.getWithDefault(maintenanceSettingsKey, {
            enabled: false,
        });
    }

    async toggleMaintenanceMode(
        setting: MaintenanceSchema,
        auditUser: IAuditUser,
    ): Promise<void> {
        //@ts-expect-error
        this.resolveMaintenance.clear();
        return this.settingService.insert(
            maintenanceSettingsKey,
            setting,
            auditUser,
            false,
        );
    }
}
