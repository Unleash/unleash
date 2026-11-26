import { FakePayloadSchemaStore } from './fake-payload-schema-store.js';
import {
    type VariantPayload,
    VariantPayloadValidator,
} from './variant-payload-validator.js';

const colorSchema = {
    type: 'object',
    properties: { color: { type: 'string' } },
    required: ['color'],
    additionalProperties: false,
};

const variant = (
    name: string,
    payload?: VariantPayload['payload'],
): VariantPayload => ({ name, payload });

const validatorWithSchema = async (
    featureName: string,
    schema: Record<string, unknown>,
) => {
    const payloadSchemaReadModel = new FakePayloadSchemaStore();
    await payloadSchemaReadModel.upsert(featureName, schema);
    return new VariantPayloadValidator(payloadSchemaReadModel);
};

test('a json payload has to match the payload schema of the feature', async () => {
    const validator = await validatorWithSchema('my-flag', colorSchema);

    await validator.assertVariantsMatchPayloadSchema('my-flag', [
        variant('red', { type: 'json', value: '{"color":"red"}' }),
    ]);
    const breaking = validator.assertVariantsMatchPayloadSchema('my-flag', [
        variant('blue', { type: 'json', value: '{"colour":"blue"}' }),
    ]);

    await expect(breaking).rejects.toThrow(
        'Request validation failed: your request body or params contain invalid data: The json payload of variant "blue" does not match the payload schema of feature "my-flag": data must have required property \'color\'',
    );
});

test('a json payload has to be valid JSON even when the feature has no payload schema', async () => {
    const validator = new VariantPayloadValidator(new FakePayloadSchemaStore());

    await expect(
        validator.assertVariantsMatchPayloadSchema('untyped-flag', [
            variant('red', { type: 'json', value: '{"color":' }),
        ]),
    ).rejects.toThrow(
        'Request validation failed: your request body or params contain invalid data: The json payload of variant "red" is not valid JSON.',
    );
});

test('a json payload may leave out an optional property named after a built-in object member', async () => {
    const validator = await validatorWithSchema('my-flag', {
        type: 'object',
        properties: { toString: { type: 'string' } },
    });

    await validator.assertVariantsMatchPayloadSchema('my-flag', [
        variant('empty', { type: 'json', value: '{}' }),
    ]);
});

test('the payload schema only applies to json payloads', async () => {
    const validator = await validatorWithSchema('my-flag', colorSchema);

    await validator.assertVariantsMatchPayloadSchema('my-flag', [
        variant('text', { type: 'string', value: 'not an object' }),
        variant('amount', { type: 'number', value: '42' }),
        variant('list', { type: 'csv', value: 'a,b' }),
        variant('empty'),
    ]);
});

test('a feature without a payload schema accepts any json payload', async () => {
    const validator = new VariantPayloadValidator(new FakePayloadSchemaStore());

    await validator.assertVariantsMatchPayloadSchema('untyped-flag', [
        variant('anything', { type: 'json', value: '{"colour":"blue"}' }),
    ]);
});

test('every payload that is not valid JSON or does not match the payload schema is listed with its reason', async () => {
    const validator = await validatorWithSchema('my-flag', colorSchema);

    const nonMatching = await validator.validateVariantPayloads('my-flag', [
        { variantName: 'blue', value: '{"color":"blue"}' },
        { variantName: 'red', value: '{"color":1}' },
        { variantName: 'broken', value: '{"color":' },
    ]);

    expect(nonMatching).toEqual([
        {
            variantName: 'red',
            value: '{"color":1}',
            error: 'data/color must be string',
        },
        {
            variantName: 'broken',
            value: '{"color":',
            error: 'The payload is not valid JSON.',
        },
    ]);
});
