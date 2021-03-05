const test = require('ava');
const faker = require('faker');
const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');
const ClientMetricsService = require('../../../lib/services/client-metrics');
const { APPLICATION_CREATED } = require('../../../lib/event-type');

let stores;
let clientMetricsService;

test.before(async () => {
    const db = await dbInit('client_metrics_service_serial', getLogger);
    stores = db.stores;
    clientMetricsService = new ClientMetricsService(stores, {
        getLogger,
        bulkInterval: 500,
        announcementInterval: 2000,
    });
});

test.after(async () => {
    await stores.db.destroy();
});
test.serial('Apps registered should be announced', async t => {
    t.plan(3);
    const clientRegistration = {
        appName: faker.internet.domainName(),
        instanceId: faker.random.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker.random.number(),
        icon: '',
        description: faker.company.catchPhrase(),
        color: faker.internet.color(),
    };
    const differentClient = {
        appName: faker.lorem.slug(2),
        instanceId: faker.random.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker.random.number(),
        icon: '',
        description: faker.company.catchPhrase(),
        color: faker.internet.color(),
    };
    await clientMetricsService.registerClient(clientRegistration, '127.0.0.1');
    await clientMetricsService.registerClient(differentClient, '127.0.0.1');
    await new Promise(res => setTimeout(res, 1200));
    const first = await stores.clientApplicationsStore.getUnannounced();
    t.is(first.length, 2);
    await clientMetricsService.registerClient(clientRegistration, '127.0.0.1');
    await new Promise(res => setTimeout(res, 2000));
    const second = await stores.clientApplicationsStore.getUnannounced();
    t.is(second.length, 0);
    const events = await stores.eventStore.getEvents();
    const appCreatedEvents = events.filter(e => e.type === APPLICATION_CREATED);
    t.is(appCreatedEvents.length, 2);
});
