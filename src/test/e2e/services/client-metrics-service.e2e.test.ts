import ClientMetricsService from '../../../lib/services/client-metrics';
import { IClientApp } from '../../../lib/types/model';

const faker = require('faker');
const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');
const { APPLICATION_CREATED } = require('../../../lib/types/events');

let stores;
let db;
let clientMetricsService;

beforeAll(async () => {
    db = await dbInit('client_metrics_service_serial', getLogger);
    stores = db.stores;
    clientMetricsService = new ClientMetricsService(
        stores,
        { getLogger },
        500,
        2000,
    );
});

afterAll(async () => {
    await clientMetricsService.destroy();
    await db.destroy();
});
test('Apps registered should be announced', async () => {
    expect.assertions(3);
    const clientRegistration: IClientApp = {
        appName: faker.internet.domainName(),
        instanceId: faker.datatype.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker.datatype.number(),
        icon: '',
        description: faker.company.catchPhrase(),
        color: faker.internet.color(),
    };
    const differentClient = {
        appName: faker.lorem.slug(2),
        instanceId: faker.datatype.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker.datatype.number(),
        icon: '',
        description: faker.company.catchPhrase(),
        color: faker.internet.color(),
    };
    await clientMetricsService.registerClient(clientRegistration, '127.0.0.1');
    await clientMetricsService.registerClient(differentClient, '127.0.0.1');
    await new Promise((res) => setTimeout(res, 1200));
    const first = await stores.clientApplicationsStore.getUnannounced();
    expect(first.length).toBe(2);
    await clientMetricsService.registerClient(clientRegistration, '127.0.0.1');
    await new Promise((res) => setTimeout(res, 2000));
    const second = await stores.clientApplicationsStore.getUnannounced();
    expect(second.length).toBe(0);
    const events = await stores.eventStore.getEvents();
    const appCreatedEvents = events.filter(
        (e) => e.type === APPLICATION_CREATED,
    );
    expect(appCreatedEvents.length).toBe(2);
});
