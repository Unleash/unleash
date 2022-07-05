// import supertest from 'supertest';
// import { createServices } from '../../services';
// import { createTestConfig } from '../../../test/config/test-config';

// import createStores from '../../../test/fixtures/store';

// import getApp from '../../app';

// async function getSetup(anonymise: boolean = false) {
//     const base = `/random${Math.round(Math.random() * 1000)}`;
//     const stores = createStores();
//     const config = createTestConfig({
//         server: { baseUriPath: base },
//         experimental: { anonymiseEventLog: anonymise },
//     });
//     const services = createServices(stores, config);
//     const app = await getApp(config, stores, services);
//     return { base, eventStore: stores.eventStore, request: supertest(app) };
// }

test('should return the same enabled toggles as the raw SDK', () => {});

test('should filter the list according to the input parameters', () => {});

test('returns the provided input arguments as part of the response', () => {});
