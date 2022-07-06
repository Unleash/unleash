import fc, { Arbitrary } from 'fast-check';

import supertest from 'supertest';
import { createServices } from '../../services';
import { createTestConfig } from '../../../test/config/test-config';

import createStores from '../../../test/fixtures/store';

import getApp from '../../app';
import {
    playgroundRequestSchema,
    PlaygroundRequestSchema,
} from '../../../lib/openapi/spec/playground-request-schema';

import {
    generate as generateRequest,
    urlFriendlyString,
} from '../../../lib/openapi/spec/playground-request-schema.test';
import { commonISOTimestamp } from '../../../lib/openapi/spec/sdk-context-schema.test';
import { ALL_OPERATORS } from '../../../lib/util/constants';
import { ClientFeatureSchema } from '../../../lib/openapi/spec/client-feature-schema';
import { PlaygroundFeatureSchema } from 'lib/openapi/spec/playground-feature-schema';

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

const constraints = () =>
    fc.array(
        fc.record({
            contextName: urlFriendlyString(),
            operator: fc.constantFrom(...ALL_OPERATORS),
            caseInsensitive: fc.boolean(),
            inverted: fc.boolean(),
            values: fc.array(fc.string()),
            value: fc.string(),
        }),
    );

const strategy = (
    name: string,
    parameters: Arbitrary<Record<string, string>>,
) =>
    fc.record({
        name: fc.constant(name),
        parameters,
        constraints: constraints(),
    });

const strategies = () =>
    fc.array(
        fc.oneof(
            strategy('default', fc.constant({})),
            strategy(
                'flexibleRollout',
                fc.record({
                    groupId: fc.lorem({ maxCount: 1 }),
                    rollout: fc.nat({ max: 100 }).map(String),
                    stickiness: fc.constantFrom(
                        'default',
                        'userId',
                        'sessionId',
                    ),
                }),
            ),
            strategy(
                'applicationHostname',
                fc.record({
                    hostNames: fc
                        .uniqueArray(fc.domain())
                        .map((ds) => ds.join(',')),
                }),
            ),

            strategy(
                'userWithId',
                fc.record({
                    userIds: fc
                        .uniqueArray(fc.lorem({ maxCount: 1 }))
                        .map((ids) => ids.join(',')),
                }),
            ),
            strategy(
                'remoteAddress',
                fc.record({
                    IPs: fc.uniqueArray(fc.ipV4()).map((ips) => ips.join(',')),
                }),
            ),
        ),
    );

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
            strategies: strategies(),
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
        { requiredKeys: ['name', 'enabled', 'project', 'strategies'] },
    );

export const generateToggles = (
    minLength?: number,
): Arbitrary<ClientFeatureSchema[]> =>
    fc.array(generateFeatureToggle(), { minLength });

describe('the playground API', () => {
    test('should filter the list according to the input parameters', async () => {
        await fc.assert(
            fc.asyncProperty(
                generateRequest(),
                generateToggles(1),
                async (
                    payload: PlaygroundRequestSchema,
                    toggles: ClientFeatureSchema[],
                ) => {
                    const { request, base } = await getSetup();

                    // get a subset of projects that exist among the toggles
                    const [projects] = fc.sample(
                        fc.oneof(
                            fc.constant('*' as '*'),
                            fc.uniqueArray(
                                fc.constantFrom(
                                    ...toggles.map((t) => t.project),
                                ),
                            ),
                        ),
                    );

                    payload.projects = projects;

                    // create a list of features that can be filtered
                    // pass in args that should filter the list

                    const { body } = await request
                        .post(`${base}/api/admin/playground`)
                        .send(payload)
                        .expect('Content-Type', /json/)
                        .expect(200);

                    console.log(
                        toggles,
                        toggles.map((t) => t.strategies),
                    );

                    switch (projects) {
                        case '*':
                            // no toggles have been filtered out
                            return body.toggles.length === toggles.length;
                        case []:
                            // no toggle should be without a project
                            return body.toggles.length === 0;
                        default:
                            // no toggle should be without a project
                            return body.toggles.every(
                                (x: PlaygroundFeatureSchema) =>
                                    projects.includes(x.projectId),
                            );
                    }
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

    test('should return 400 if any of the required query properties are missing', async () => {
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

                    return status === 400;
                },
            ),
        );
    });

    test('should return a subset of the toggles in the actual db', () => {
        // find a way to verify that the returned toggles (responseBody.toggles)
        // is actually a subset of the toggles that exist in the
        // database/repository. To ensure that it's not just a hardcoded empty
        // list or similar.
    });
});
