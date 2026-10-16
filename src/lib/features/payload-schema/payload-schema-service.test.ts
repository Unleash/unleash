import { BadDataError } from '../../error/index.js';
import { createFakePayloadSchemaService } from './createPayloadSchemaService.js';

test('refuses a payload schema that is not a valid JSON Schema', async () => {
    const payloadSchemaService = createFakePayloadSchemaService();

    const upsert = payloadSchemaService.upsertPayloadSchema({
        projectId: 'default',
        featureName: 'my-flag',
        schema: { tpye: 'string' },
    });

    await expect(upsert).rejects.toThrow(BadDataError);
    expect(
        await payloadSchemaService.getPayloadSchema('my-flag'),
    ).toBeUndefined();
});
