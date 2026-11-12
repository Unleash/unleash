import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { PayloadSchemaReadModel } from './payload-schema-read-model.js';
import { PayloadSchemaStore } from './payload-schema-store.js';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('payload_schema_store', getLogger);
    await db.stores.featureToggleStore.create('default', {
        name: 'typed-flag',
        createdByUserId: 9999,
    });
});

afterAll(async () => {
    await db.destroy();
});

test('the latest saved payload schema is read back exactly as written', async () => {
    const store = new PayloadSchemaStore(db.rawDatabase);
    const readModel = new PayloadSchemaReadModel(db.rawDatabase);
    const first = {
        type: 'object',
        properties: {
            model: { type: 'string' },
            temperature: { type: 'number' },
        },
    };
    const second = { type: 'string' };

    const beforeAnySave = await readModel.getPayloadSchema('typed-flag');
    await store.upsert('typed-flag', first);
    const afterFirstSave = await readModel.getPayloadSchema('typed-flag');
    await store.upsert('typed-flag', second);
    const afterSecondSave = await store.get('typed-flag');

    expect(beforeAnySave).toBeUndefined();
    expect(JSON.stringify(afterFirstSave)).toBe(JSON.stringify(first));
    expect(afterSecondSave).toEqual(second);
});
