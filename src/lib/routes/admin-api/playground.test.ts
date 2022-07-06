import fc, { Arbitrary } from 'fast-check';

import supertest from 'supertest';
import { createServices } from '../../services';
import { createTestConfig } from '../../../test/config/test-config';

import createStores from '../../../test/fixtures/store';

import getApp from '../../app';
import { PlaygroundRequestSchema } from 'lib/openapi/spec/playground-request-schema';

// some strings should be URL-friendly
// some props should be nullable / undefinable
const requestPayload = (): Arbitrary<PlaygroundRequestSchema> =>
    fc.record({
        environment: fc.asciiString(),
        projects: fc.uniqueArray(fc.asciiString()),
        context: fc.record({
            appName: fc.string(),
            currentTime: fc.date().map((x) => x.toString()),
            environment: fc.string(),
            properties: fc.dictionary(fc.string(), fc.string()),
            remoteAddress: fc.ipV4(),
            sessionId: fc.uuid(),
            userId: fc.emailAddress(),
        }),
    });

async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
    });
    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);
    return { base, request: supertest(app) };
}

test('should return the same enabled toggles as the raw SDK', () => {});

test('should filter the list according to the input parameters', () => {});

test('should return the provided input arguments as part of the response', async () => {
    // fc.assert(fc.property(fc.string(), (text) => false));
    fc.assert(
        fc.asyncProperty(requestPayload(), async (payload) =>
            getSetup()
                .then(({ request, base }) =>
                    request
                        .get(`${base}/api/admin/playground`)
                        .expect('Content-Type', /json/)
                        .expect(200),
                )
                .then(({ body }) => body.input === payload),
        ),
    );
});
