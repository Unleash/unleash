import { ConstraintsReadModel } from './constraints-read-model.js';
import FakeContextFieldStore from '../context/fake-context-field-store.js';
import type { IConstraint } from '../../types/index.js';

const createReadModel = (contextFieldStore?: FakeContextFieldStore) => {
    const store = contextFieldStore ?? new FakeContextFieldStore();
    const readModel = new ConstraintsReadModel(store);
    return { readModel, store };
};

describe('ConstraintsReadModel - validateConstraints', () => {
    describe('valid constraints', () => {
        test('validates a string operator constraint (IN)', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'someField',
                    operator: 'IN',
                    values: ['a', 'b'],
                },
            ];

            const result = await readModel.validateConstraints(constraints);

            expect(result).toHaveLength(1);
            expect(result[0].operator).toBe('IN');
        });

        test('validates a NOT_IN constraint', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'someField',
                    operator: 'NOT_IN',
                    values: ['x', 'y'],
                },
            ];

            const result = await readModel.validateConstraints(constraints);

            expect(result).toHaveLength(1);
            expect(result[0].operator).toBe('NOT_IN');
        });

        test('validates a numeric operator constraint', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'someField',
                    operator: 'NUM_EQ',
                    value: '5',
                    values: [],
                },
            ];

            const result = await readModel.validateConstraints(constraints);

            expect(result).toHaveLength(1);
            expect(result[0].operator).toBe('NUM_EQ');
        });

        test('validates a semver operator constraint', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'someField',
                    operator: 'SEMVER_EQ',
                    value: '1.2.3',
                    values: [],
                },
            ];

            const result = await readModel.validateConstraints(constraints);

            expect(result).toHaveLength(1);
            expect(result[0].operator).toBe('SEMVER_EQ');
        });

        test('validates a date operator constraint', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'someField',
                    operator: 'DATE_AFTER',
                    value: '2024-01-01T00:00:00.000Z',
                    values: [],
                },
            ];

            const result = await readModel.validateConstraints(constraints);

            expect(result).toHaveLength(1);
            expect(result[0].operator).toBe('DATE_AFTER');
        });

        test('validates a REGEX constraint', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'someField',
                    operator: 'REGEX',
                    value: '^test.*$',
                    values: [],
                },
            ];

            const result = await readModel.validateConstraints(constraints);

            expect(result).toHaveLength(1);
            expect(result[0].operator).toBe('REGEX');
        });

        test('validates multiple constraints at once', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'fieldA',
                    operator: 'IN',
                    values: ['a'],
                },
                {
                    contextName: 'fieldB',
                    operator: 'NUM_GT',
                    value: '10',
                    values: [],
                },
                {
                    contextName: 'fieldC',
                    operator: 'SEMVER_LT',
                    value: '2.0.0',
                    values: [],
                },
            ];

            const result = await readModel.validateConstraints(constraints);

            expect(result).toHaveLength(3);
        });

        test('returns empty array for empty input', async () => {
            const { readModel } = createReadModel();

            const result = await readModel.validateConstraints([]);

            expect(result).toEqual([]);
        });

        test('defaults values to empty array when not provided for non-string operators', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'someField',
                    operator: 'NUM_EQ',
                    value: '5',
                } as IConstraint,
            ];

            const result = await readModel.validateConstraints(constraints);

            expect(result[0].values).toEqual([]);
        });
    });

    describe('invalid constraints', () => {
        test('rejects invalid operator', async () => {
            const { readModel } = createReadModel();
            const constraints = [
                {
                    contextName: 'someField',
                    operator: 'INVALID_OP',
                    values: ['a'],
                },
            ] as unknown as IConstraint[];

            await expect(
                readModel.validateConstraints(constraints),
            ).rejects.toThrow();
        });

        test('rejects missing contextName', async () => {
            const { readModel } = createReadModel();
            const constraints = [
                {
                    operator: 'IN',
                    values: ['a'],
                },
            ] as unknown as IConstraint[];

            await expect(
                readModel.validateConstraints(constraints),
            ).rejects.toThrow();
        });

        test('rejects invalid number for NUM operator', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'someField',
                    operator: 'NUM_EQ',
                    value: 'not-a-number',
                    values: [],
                },
            ];

            await expect(
                readModel.validateConstraints(constraints),
            ).rejects.toThrow();
        });

        test('rejects invalid semver for SEMVER operator', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'someField',
                    operator: 'SEMVER_EQ',
                    value: 'not-semver',
                    values: [],
                },
            ];

            await expect(
                readModel.validateConstraints(constraints),
            ).rejects.toThrow();
        });

        test('rejects invalid date for DATE operator', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'someField',
                    operator: 'DATE_BEFORE',
                    value: 'not-a-date',
                    values: [],
                },
            ];

            await expect(
                readModel.validateConstraints(constraints),
            ).rejects.toThrow();
        });

        test('rejects invalid regex for REGEX operator', async () => {
            const { readModel } = createReadModel();
            const constraints: IConstraint[] = [
                {
                    contextName: 'someField',
                    operator: 'REGEX',
                    value: '(?!invalid)',
                    values: [],
                },
            ];

            await expect(
                readModel.validateConstraints(constraints),
            ).rejects.toThrow();
        });
    });

    describe('legal values validation', () => {
        test('accepts values matching legal values for string operators', async () => {
            const store = new FakeContextFieldStore();
            await store.create({
                name: 'country',
                description: 'Country',
                sortOrder: 0,
                stickiness: false,
                legalValues: [
                    { value: 'US' },
                    { value: 'UK' },
                    { value: 'DE' },
                ],
            });
            const { readModel } = createReadModel(store);

            const constraints: IConstraint[] = [
                {
                    contextName: 'country',
                    operator: 'IN',
                    values: ['US', 'UK'],
                },
            ];

            const result = await readModel.validateConstraints(constraints);
            expect(result).toHaveLength(1);
        });

        test('rejects values not in legal values for string operators', async () => {
            const store = new FakeContextFieldStore();
            await store.create({
                name: 'country',
                description: 'Country',
                sortOrder: 0,
                stickiness: false,
                legalValues: [{ value: 'US' }, { value: 'UK' }],
            });
            const { readModel } = createReadModel(store);

            const constraints: IConstraint[] = [
                {
                    contextName: 'country',
                    operator: 'IN',
                    values: ['US', 'INVALID'],
                },
            ];

            await expect(
                readModel.validateConstraints(constraints),
            ).rejects.toThrow();
        });

        test('validates single value against legal values for NUM operators', async () => {
            const store = new FakeContextFieldStore();
            await store.create({
                name: 'priority',
                description: 'Priority',
                sortOrder: 0,
                stickiness: false,
                legalValues: [{ value: '1' }, { value: '2' }, { value: '3' }],
            });
            const { readModel } = createReadModel(store);

            const constraints: IConstraint[] = [
                {
                    contextName: 'priority',
                    operator: 'NUM_EQ',
                    value: '1',
                    values: [],
                },
            ];

            const result = await readModel.validateConstraints(constraints);
            expect(result).toHaveLength(1);
        });

        test('rejects single value not in legal values for NUM operators', async () => {
            const store = new FakeContextFieldStore();
            await store.create({
                name: 'priority',
                description: 'Priority',
                sortOrder: 0,
                stickiness: false,
                legalValues: [{ value: '1' }, { value: '2' }],
            });
            const { readModel } = createReadModel(store);

            const constraints: IConstraint[] = [
                {
                    contextName: 'priority',
                    operator: 'NUM_EQ',
                    value: '99',
                    values: [],
                },
            ];

            await expect(
                readModel.validateConstraints(constraints),
            ).rejects.toThrow();
        });

        test('skips legal values check when context field has no legal values', async () => {
            const store = new FakeContextFieldStore();
            await store.create({
                name: 'customField',
                description: 'Custom',
                sortOrder: 0,
                stickiness: false,
                legalValues: [],
            });
            const { readModel } = createReadModel(store);

            const constraints: IConstraint[] = [
                {
                    contextName: 'customField',
                    operator: 'IN',
                    values: ['anything'],
                },
            ];

            const result = await readModel.validateConstraints(constraints);
            expect(result).toHaveLength(1);
        });

        test('skips legal values check when context field does not exist', async () => {
            const { readModel } = createReadModel();

            const constraints: IConstraint[] = [
                {
                    contextName: 'nonExistent',
                    operator: 'IN',
                    values: ['anything'],
                },
            ];

            const result = await readModel.validateConstraints(constraints);
            expect(result).toHaveLength(1);
        });

        test('validates value (not values) for SEMVER operators against legal values', async () => {
            const store = new FakeContextFieldStore();
            await store.create({
                name: 'version',
                description: 'Version',
                sortOrder: 0,
                stickiness: false,
                legalValues: [{ value: '1.0.0' }, { value: '2.0.0' }],
            });
            const { readModel } = createReadModel(store);

            const constraints: IConstraint[] = [
                {
                    contextName: 'version',
                    operator: 'SEMVER_GT',
                    value: '1.0.0',
                    values: [],
                },
            ];

            const result = await readModel.validateConstraints(constraints);
            expect(result).toHaveLength(1);
        });

        test('validates value (not values) for DATE operators against legal values', async () => {
            const store = new FakeContextFieldStore();
            const dateValue = '2024-06-01T00:00:00.000Z';
            await store.create({
                name: 'releaseDate',
                description: 'Release date',
                sortOrder: 0,
                stickiness: false,
                legalValues: [{ value: dateValue }],
            });
            const { readModel } = createReadModel(store);

            const constraints: IConstraint[] = [
                {
                    contextName: 'releaseDate',
                    operator: 'DATE_AFTER',
                    value: dateValue,
                    values: [],
                },
            ];

            const result = await readModel.validateConstraints(constraints);
            expect(result).toHaveLength(1);
        });

        test('validates value (not values) for REGEX operator against legal values', async () => {
            const store = new FakeContextFieldStore();
            await store.create({
                name: 'pattern',
                description: 'Pattern',
                sortOrder: 0,
                stickiness: false,
                legalValues: [{ value: '^abc$' }, { value: '^def$' }],
            });
            const { readModel } = createReadModel(store);

            const constraints: IConstraint[] = [
                {
                    contextName: 'pattern',
                    operator: 'REGEX',
                    value: '^abc$',
                    values: [],
                },
            ];

            const result = await readModel.validateConstraints(constraints);
            expect(result).toHaveLength(1);
        });
    });
});
