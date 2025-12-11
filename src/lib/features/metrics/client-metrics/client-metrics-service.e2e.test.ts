import ClientInstanceService from '../instance/instance-service.js';
import type { IClientApp } from '../../../types/model.js';
import { secondsToMilliseconds } from 'date-fns';
import { createTestConfig } from '../../../../test/config/test-config.js';
import type { IUnleashConfig, IUnleashStores } from '../../../types/index.js';
import { APPLICATION_CREATED } from '../../../events/index.js';
import { FakePrivateProjectChecker } from '../../private-project/fakePrivateProjectChecker.js';
import type { ITestDb } from '../../../../test/e2e/helpers/database-init.js';
import dbInit from '../../../../test/e2e/helpers/database-init.js';
import { noLoggerProvider as getLogger } from '../../../../test/fixtures/no-logger.js';
import { faker } from '@faker-js/faker';
let stores: IUnleashStores;
let db: ITestDb;
let clientInstanceService: ClientInstanceService;
let config: IUnleashConfig;
beforeAll(async () => {
    db = await dbInit('client_metrics_service_serial', getLogger);
    stores = db.stores;
    config = createTestConfig({});
    const _bulkInterval = secondsToMilliseconds(0.5);
    const _announcementInterval = secondsToMilliseconds(2);

    clientInstanceService = new ClientInstanceService(
        stores,
        config,
        new FakePrivateProjectChecker(),
    );
});

afterAll(async () => {
    await db.destroy();
});
test('Apps registered should be announced', async () => {
    expect.assertions(3);
    const clientRegistration: IClientApp = {
        appName: faker.internet.domainName(),
        instanceId: faker.string.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker.number.int(),
        icon: '',
        description: faker.company.catchPhrase(),
        color: faker.color.rgb(),
    };
    const differentClient = {
        appName: faker.string.uuid(),
        instanceId: faker.string.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker.number.int(),
        icon: '',
        description: faker.company.catchPhrase(),
        color: faker.color.rgb(),
    };
    await clientInstanceService.registerBackendClient(
        clientRegistration,
        '127.0.0.1',
    );
    await clientInstanceService.registerBackendClient(
        differentClient,
        '127.0.0.1',
    );
    await clientInstanceService.bulkAdd(); // in prod called by a SchedulerService
    const first = await stores.clientApplicationsStore.getUnannounced();
    expect(first.length).toBe(2);
    await clientInstanceService.registerBackendClient(
        clientRegistration,
        '127.0.0.1',
    );
    await clientInstanceService.announceUnannounced(); // in prod called by a SchedulerService
    const second = await stores.clientApplicationsStore.getUnannounced();
    expect(second.length).toBe(0);
    const events = await stores.eventStore.getEvents();
    const appCreatedEvents = events.filter(
        (e) => e.type === APPLICATION_CREATED,
    );
    expect(appCreatedEvents.length).toBe(2);
});
