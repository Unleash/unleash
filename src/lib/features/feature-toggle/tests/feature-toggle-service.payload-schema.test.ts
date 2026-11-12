import { createTestConfig } from '../../../../test/config/test-config.js';
import type { IAuditUser, IStrategyVariant } from '../../../types/index.js';
import { DEFAULT_ENV } from '../../../util/index.js';
import { FakePayloadSchemaReadModel } from '../../payload-schema/fake-payload-schema-read-model.js';
import { createFakeFeatureToggleService } from '../createFeatureToggleService.js';

const context = {
    projectId: 'default',
    featureName: 'typed-flag',
    environment: DEFAULT_ENV,
};
const auditUser = {} as IAuditUser;

const createService = async ({ payloadSchemas } = { payloadSchemas: true }) => {
    const payloadSchemaReadModel = new FakePayloadSchemaReadModel();
    const { featureToggleService, featureToggleStore } =
        createFakeFeatureToggleService(
            createTestConfig({ experimental: { flags: { payloadSchemas } } }),
            { payloadSchemaReadModel },
        );
    await featureToggleStore.create('default', {
        name: 'typed-flag',
        createdByUserId: 1,
    });
    return { featureToggleService, payloadSchemaReadModel };
};

const strategyWithJsonVariant = (value: string) => ({
    name: 'default',
    constraints: [],
    parameters: {},
    variants: [
        {
            name: 'blue',
            weight: 1000,
            weightType: 'variable',
            stickiness: 'default',
            payload: { type: 'json', value },
        } satisfies IStrategyVariant,
    ],
});

test("a strategy cannot be created with a variant payload that breaks the flag's payload schema", async () => {
    const { featureToggleService, payloadSchemaReadModel } =
        await createService();
    payloadSchemaReadModel.setPayloadSchema('typed-flag', {
        type: 'object',
        properties: { color: { type: 'string' } },
    });

    const creation = featureToggleService.unprotectedCreateStrategy(
        strategyWithJsonVariant('{"color":1}'),
        context,
        auditUser,
    );

    await expect(creation).rejects.toThrow(
        'variant "blue" does not match the payload schema of feature "typed-flag"',
    );
});

test("a strategy cannot be changed to a variant payload that breaks the flag's payload schema", async () => {
    const { featureToggleService, payloadSchemaReadModel } =
        await createService();
    payloadSchemaReadModel.setPayloadSchema('typed-flag', {
        type: 'object',
        properties: { color: { type: 'string' } },
    });
    const existing = await featureToggleService.unprotectedCreateStrategy(
        strategyWithJsonVariant('{"color":"blue"}'),
        context,
        auditUser,
    );

    const update = featureToggleService.unprotectedUpdateStrategy(
        existing.id,
        strategyWithJsonVariant('{"color":1}'),
        context,
        auditUser,
    );

    await expect(update).rejects.toThrow(
        'variant "blue" does not match the payload schema of feature "typed-flag"',
    );
});

test('payload schemas are not enforced while the payloadSchemas flag is off', async () => {
    const { featureToggleService, payloadSchemaReadModel } =
        await createService({ payloadSchemas: false });
    payloadSchemaReadModel.setPayloadSchema('typed-flag', {
        type: 'object',
        properties: { color: { type: 'string' } },
    });

    const created = await featureToggleService.unprotectedCreateStrategy(
        strategyWithJsonVariant('{"color":1}'),
        context,
        auditUser,
    );

    expect(created.variants?.[0].payload).toEqual({
        type: 'json',
        value: '{"color":1}',
    });
});
