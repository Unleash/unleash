import { IUnleashConfig, IUnleashStores } from '../types';
import { Logger } from '../logger';
import { IPatStore } from '../types/stores/pat-store';
import { IEventStore } from '../types/stores/event-store';
import SettingService from './setting-service';
import { maintenanceSettingsKey } from '../types/settings/maintenance-settings';
import { MaintenanceSchema } from '../openapi/spec/maintenance-schema';
import { SchedulerService } from './scheduler-service';

export default class MaintenanceService {
    private config: IUnleashConfig;

    private logger: Logger;

    private patStore: IPatStore;

    private eventStore: IEventStore;

    private settingService: SettingService;

    private schedulerService: SchedulerService;

    constructor(
        {
            patStore,
            eventStore,
        }: Pick<IUnleashStores, 'patStore' | 'eventStore'>,
        config: IUnleashConfig,
        settingService: SettingService,
        schedulerService: SchedulerService,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/pat-service.ts');
        this.patStore = patStore;
        this.eventStore = eventStore;
        this.settingService = settingService;
        this.schedulerService = schedulerService;
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
    ): Promise<void> {
        if (setting.enabled) {
            this.schedulerService.pause();
        } else {
            this.schedulerService.resume();
        }
        return this.settingService.insert(
            maintenanceSettingsKey,
            setting,
            user,
        );
    }
}

module.exports = MaintenanceService;
