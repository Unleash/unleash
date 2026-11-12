import { FakePayloadSchemaReadModel } from './fake-payload-schema-read-model.js';
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

const validatorWithSchema = (
    featureName: string,
    schema: Record<string, unknown>,
) => {
    const payloadSchemaReadModel = new FakePayloadSchemaReadModel();
    payloadSchemaReadModel.setPayloadSchema(featureName, schema);
    return new VariantPayloadValidator(payloadSchemaReadModel);
};

test('a json payload has to match the payload schema of the feature', async () => {
    const validator = validatorWithSchema('my-flag', colorSchema);

    await validator.validateVariants('my-flag', [
        variant('red', { type: 'json', value: '{"color":"red"}' }),
    ]);
    const breaking = validator.validateVariants('my-flag', [
        variant('blue', { type: 'json', value: '{"colour":"blue"}' }),
    ]);

    await expect(breaking).rejects.toThrow(
        'Request validation failed: your request body or params contain invalid data: The json payload of variant "blue" does not match the payload schema of feature "my-flag": data must have required property \'color\'',
    );
});

test('a json payload has to be valid JSON even when the feature has no payload schema', async () => {
    const validator = new VariantPayloadValidator(
        new FakePayloadSchemaReadModel(),
    );

    await expect(
        validator.validateVariants('untyped-flag', [
            variant('red', { type: 'json', value: '{"color":' }),
        ]),
    ).rejects.toThrow(
        'Request validation failed: your request body or params contain invalid data: The json payload of variant "red" is not valid JSON.',
    );
});

test('the payload schema only applies to json payloads', async () => {
    const validator = validatorWithSchema('my-flag', colorSchema);

    await validator.validateVariants('my-flag', [
        variant('text', { type: 'string', value: 'not an object' }),
        variant('amount', { type: 'number', value: '42' }),
        variant('list', { type: 'csv', value: 'a,b' }),
        variant('empty'),
    ]);
});

test('a feature without a payload schema accepts any json payload', async () => {
    const validator = new VariantPayloadValidator(
        new FakePayloadSchemaReadModel(),
    );

    await validator.validateVariants('untyped-flag', [
        variant('anything', { type: 'json', value: '{"colour":"blue"}' }),
    ]);
});
