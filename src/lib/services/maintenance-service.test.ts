import { SchedulerService } from './scheduler-service';
import MaintenanceService from './maintenance-service';
import { IUnleashStores } from '../types';
import SettingService from './setting-service';
import { createTestConfig } from '../../test/config/test-config';

test('Maintenance on should pause scheduler', async () => {
    const config = createTestConfig();
    const schedulerService = new SchedulerService(config.getLogger);
    const maintenanceService = new MaintenanceService(
        {} as IUnleashStores,
        config,
        { insert() {} } as unknown as SettingService,
        schedulerService,
    );

    await maintenanceService.toggleMaintenanceMode(
        { enabled: true },
        'irrelevant user',
    );

    expect(schedulerService.getMode()).toBe('paused');
    schedulerService.stop();
});

test('Maintenance off should resume scheduler', async () => {
    const config = createTestConfig();
    const schedulerService = new SchedulerService(config.getLogger);
    schedulerService.pause();
    const maintenanceService = new MaintenanceService(
        {} as IUnleashStores,
        config,
        { insert() {} } as unknown as SettingService,
        schedulerService,
    );

    await maintenanceService.toggleMaintenanceMode(
        { enabled: false },
        'irrelevant user',
    );

    expect(schedulerService.getMode()).toBe('active');
    schedulerService.stop();
});
