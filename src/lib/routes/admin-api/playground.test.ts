import fc, { Arbitrary } from 'fast-check';

import supertest from 'supertest';
import { createServices } from '../../services';
import { createTestConfig } from '../../../test/config/test-config';

import createStores from '../../../test/fixtures/store';

import getApp from '../../app';
import { PlaygroundRequestSchema } from '../../../lib/openapi/spec/playground-request-schema';

import {
    generate as generateRequest,
    urlFriendlyString,
} from '../../../lib/openapi/spec/playground-request-schema.test';
import { commonISOTimestamp } from '../../../lib/openapi/spec/sdk-context-schema.test';
import { ALL_OPERATORS } from '../../../lib/util/constants';
import { ClientFeatureSchema } from '../../../lib/openapi/spec/client-feature-schema';

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

const generateFeatureToggle = (): Arbitrary<ClientFeatureSchema> =>
    fc.record(
        {
            name: urlFriendlyString(),
            type: fc.constantFrom(
                'release',
                'kill switch',
                'experiment',
                'operational',
                'permission',
            ),
            description: fc.lorem(),
            project: urlFriendlyString(),
            enabled: fc.boolean(),
            createdAt: commonISOTimestamp(),
            lastSeenAt: commonISOTimestamp(),
            stale: fc.boolean(),
            impressionData: fc.option(fc.boolean()),
            strategies: fc.array(
                fc.record(
                    {
                        name: urlFriendlyString(),
                        id: fc.uuid(),
                        sortOrder: fc.integer(),
                        segments: fc.array(fc.nat()),
                        constraints: fc.array(
                            fc.record({
                                contextName: urlFriendlyString(),
                                operator: fc.constantFrom(ALL_OPERATORS),
                                caseInsensitive: fc.boolean(),
                                inverted: fc.boolean(),
                                values: fc.array(fc.string()),
                                value: fc.string(),
                            }),
                        ),
                        parameters: fc.nat(),
                    },
                    { requiredKeys: ['name'] },
                ),
            ),
            variants: fc.array(
                fc.record({
                    name: urlFriendlyString(),
                    weight: fc.nat({ max: 100 }),
                    payload: fc.record({
                        type: fc.constantFrom('json', 'csv', 'string'),
                        value: fc.string(),
                    }),
                }),
            ),
        },
        { requiredKeys: ['name', 'enabled'] },
    );

const generateToggles = (): Arbitrary<ClientFeatureSchema[]> =>
    fc.array(generateFeatureToggle());

test('should return the same enabled toggles as the raw SDK', () => {
    // initialize a client, bootstrap with a list of toggles
    //
    // hit the client directly and hit the endpoint
    //
    // expect the two lists to be the same (order not withstanding)
    //
    // can either sort the lists or use expect.(not.)arrayContaining(expected)
    // https://jestjs.io/docs/expect#expectarraycontainingarray /
    // https://jestjs.io/docs/expect#expectnotarraycontainingarray
});

test('should filter the list according to the input parameters', async () => {
    await fc.assert(
        fc.asyncProperty(
            generateRequest(),
            generateToggles(),
            async (
                payload: PlaygroundRequestSchema,
                toggles: ClientFeatureSchema[],
            ) => {
                const { request, base } = await getSetup();

                // console.log(toggles);

                // create a list of features that can be filtered

                // pass in args that should filter the list

                // make sure that none of the returned toggles have anything to do with the filter

                const { body } = await request
                    .post(`${base}/api/admin/playground`)
                    .send(payload)
                    .expect('Content-Type', /json/)
                    .expect(200);

                console.log(toggles, body);

                // return body.toggles.every(x => !x...something)

                return false;
            },
        ),
    );
});

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
