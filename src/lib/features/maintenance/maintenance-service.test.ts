import { SchedulerService } from '../scheduler/scheduler-service';
import MaintenanceService from './maintenance-service';
import SettingService from '../../services/setting-service';
import { createTestConfig } from '../../../test/config/test-config';
import FakeSettingStore from '../../../test/fixtures/fake-setting-store';
import EventService from '../events/event-service';

test('Scheduler should run scheduled functions if maintenance mode is off', async () => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
        config.eventBus,
    );

    const job = jest.fn();

    await schedulerService.schedule(job, 10, 'test-id');

    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});

test('Scheduler should not run scheduled functions if maintenance mode is on', async () => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
        config.eventBus,
    );

    await maintenanceService.toggleMaintenanceMode(
        { enabled: true },
        'irrelevant user',
        -9999,
    );

    const job = jest.fn();

    await schedulerService.schedule(job, 10, 'test-id');

    expect(job).toBeCalledTimes(0);
    schedulerService.stop();
});
