import fc from 'fast-check';

import supertest from 'supertest';
import { createServices } from '../../services';
import { createTestConfig } from '../../../test/config/test-config';

import createStores from '../../../test/fixtures/store';

import getApp from '../../app';
import { PlaygroundRequestSchema } from '../../../lib/openapi/spec/playground-request-schema';

import { generate as generateRequest } from '../../../lib/openapi/spec/playground-request-schema.test';

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

test('should filter the list according to the input parameters', async () => {});

test('should return the provided input arguments as part of the response', async () => {
    await fc.assert(
        fc.asyncProperty(
            generateRequest(),
            async (payload: PlaygroundRequestSchema) => {
                const { request, base } = await getSetup();
                const { body } = await request
                    .post(`${base}/api/admin/playground`)
                    .send(payload)
                    .expect('Content-Type', /json/)
                    .expect(200);

                expect(body.input).toStrictEqual(payload);

                return true;
            },
        ),
    );
});
