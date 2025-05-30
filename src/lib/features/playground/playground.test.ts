import fc from 'fast-check';

import supertest from 'supertest';
import { createServices } from '../../services/index.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import { it } from '@fast-check/vitest';
import { describe } from 'vitest';
import createStores from '../../../test/fixtures/store.js';

import getApp from '../../app.js';
import {
    playgroundRequestSchema,
    type PlaygroundRequestSchema,
} from '../../openapi/spec/playground-request-schema.js';

import { generate as generateRequest } from '../../openapi/spec/playground-request-schema.test.js';
import { clientFeatures } from '../../../test/arbitraries.test.js';

async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
        experimental: { flags: { strictSchemaValidation: true } },
    });
    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);
    return { base, request: supertest(app) };
}
describe('toggle generator', () => {
    it('generates toggles with unique names', () => {
        fc.assert(
            fc.property(
                clientFeatures({ minLength: 2 }),
                (toggles) =>
                    toggles.length ===
                    [...new Set(toggles.map((feature) => feature.name))].length,
            ),
        );
    });
});

const testParams = {
    interruptAfterTimeLimit: 4000, // Default timeout in Jest is 5000ms
    markInterruptAsFailure: false, // When set to false, timeout during initial cases will not be considered as a failure
};
describe('the playground API', () => {
    it('should return the provided input arguments as part of the response', async () => {
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
            testParams,
        );
    });

    it('should return 400 if any of the required query properties are missing', async () => {
        await fc.assert(
            fc.asyncProperty(
                generateRequest(),
                fc.constantFrom(...playgroundRequestSchema.required),
                async (payload, requiredKey) => {
                    const { request, base } = await getSetup();

                    delete payload[requiredKey];

                    const { status } = await request
                        .post(`${base}/api/admin/playground`)
                        .send(payload)
                        .expect('Content-Type', /json/);

                    expect(status).toBe(400);
                },
            ),
            testParams,
        );
    });
});
