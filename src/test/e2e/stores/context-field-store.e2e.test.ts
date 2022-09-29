import dbInit, { ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { IContextFieldDto } from 'lib/types/stores/context-field-store';
import fc, { Arbitrary } from 'fast-check';
import { IUnleashStores } from 'lib/types';

let stores: IUnleashStores;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('context_store_serial', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    await db.destroy();
});

const cleanup = async () => {
    await stores.contextFieldStore.deleteAll();
};

const contextFieldDto = (): Arbitrary<IContextFieldDto> =>
    fc.record(
        {
            name: fc.uuid(),
            sortOrder: fc.integer(),
            stickiness: fc.boolean(),
            description: fc.lorem({ mode: 'sentences' }),
            legalValues: fc.array(
                fc.record(
                    {
                        value: fc.lorem({ maxCount: 1 }),
                        description: fc.lorem({ mode: 'sentences' }),
                    },
                    { requiredKeys: ['value'] },
                ),
            ),
        },
        { requiredKeys: ['name'] },
    );

test('creating an arbitrary context field should return the created context field', async () => {
    await fc.assert(
        fc
            .asyncProperty(contextFieldDto(), async (input) => {
                const { createdAt, ...storedData } =
                    await stores.contextFieldStore.create(input);

                Object.entries(input).forEach(([key, value]) => {
                    expect(storedData[key]).toStrictEqual(value);
                });
            })
            .afterEach(cleanup),
    );
});

test('updating a context field should update the specified fields and leave everything else untouched', async () => {
    await fc.assert(
        fc
            .asyncProperty(
                contextFieldDto(),
                contextFieldDto(),
                async (original, { name, ...updateData }) => {
                    await stores.contextFieldStore.create(original);

                    const { createdAt, ...updatedData } =
                        await stores.contextFieldStore.update({
                            name: original.name,
                            ...updateData,
                        });

                    const allKeys = [
                        'sortOrder',
                        'stickiness',
                        'description',
                        'legalValues',
                    ];
                    const updateKeys = Object.keys(updateData);

                    const unchangedKeys = allKeys.filter(
                        (k) => !updateKeys.includes(k),
                    );

                    Object.entries(updateData).forEach(([key, value]) => {
                        expect(updatedData[key]).toStrictEqual(value);
                    });

                    for (const key in unchangedKeys) {
                        expect(updatedData[key]).toStrictEqual(original[key]);
                    }
                },
            )
            .afterEach(cleanup),
    );
});
