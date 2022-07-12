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
import { WeightType } from '../../../lib/types/model';
import { FeatureStrategySchema } from '../../../lib/openapi/spec/feature-strategy-schema';
import { ConstraintSchema } from 'lib/openapi/spec/constraint-schema';

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

const strategyConstraints = (): Arbitrary<ConstraintSchema[]> =>
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
        constraints: strategyConstraints(),
    });

export const strategies = (): Arbitrary<FeatureStrategySchema[]> =>
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
                        .map((domains) => domains.join(',')),
                }),
            ),

            strategy(
                'userWithId',
                fc.record({
                    userIds: fc
                        .uniqueArray(fc.emailAddress())
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

export const generateFeature = (
    name?: string,
): Arbitrary<ClientFeatureSchema> =>
    fc.record(
        {
            name: name ? fc.constant(name) : urlFriendlyString(),
            type: fc.constantFrom(
                'release',
                'kill-switch',
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
                    weight: fc.nat({ max: 1000 }),
                    weightType: fc.constant(WeightType.VARIABLE),
                    stickiness: fc.constant('default'),
                    payload: fc.option(
                        fc.oneof(
                            fc.record({
                                type: fc.constant('json'),
                                value: fc.json(),
                            }),
                            fc.record({
                                type: fc.constant('csv'),
                                value: fc
                                    .array(fc.lorem())
                                    .map((words) => words.join(',')),
                            }),
                            fc.record({
                                type: fc.constant('string'),
                                value: fc.string(),
                            }),
                        ),
                    ),
                }),
            ),
        },
        { requiredKeys: ['name', 'enabled', 'project', 'strategies'] },
    );

export const generateFeatures = (constraints?: {
    minLength?: number;
}): Arbitrary<ClientFeatureSchema[]> =>
    fc.uniqueArray(generateFeature(), {
        ...constraints,
        selector: (v) => v.name,
    });

describe('toggle generator', () => {
    it('generates toggles with unique names', () => {
        fc.assert(
            fc.property(
                generateFeatures({ minLength: 2 }),
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
            testParams,
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
            testParams,
        );
    });
});
