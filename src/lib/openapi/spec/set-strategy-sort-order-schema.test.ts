import { validateSchema } from '../validate';
import { SetStrategySortOrderSchema } from './set-strategy-sort-order-schema';

test('setStrategySortOrderSchema', () => {
    const data: SetStrategySortOrderSchema = [
        { id: 'strategy-1', sortOrder: 1 },
        { id: 'strategy-2', sortOrder: 2 },
        { id: 'strategy-3', sortOrder: 3 },
    ];

    expect(
        validateSchema('#/components/schemas/setStrategySortOrderSchema', data),
    ).toBeUndefined();
});

test('setStrategySortOrderSchema missing sortOrder', () => {
    expect(
        validateSchema('#/components/schemas/setStrategySortOrderSchema', [
            { id: 'strategy-1' },
        ]),
    ).toMatchSnapshot();
});

test('setStrategySortOrderSchema missing id', () => {
    expect(
        validateSchema('#/components/schemas/setStrategySortOrderSchema', [
            { sortOrder: 123 },
            { sortOrder: 7 },
        ]),
    ).toMatchSnapshot();
});

test('setStrategySortOrderSchema wrong sortOrder type', () => {
    expect(
        validateSchema('#/components/schemas/setStrategySortOrderSchema', [
            { id: 'strategy-1', sortOrder: 'test' },
        ]),
    ).toMatchSnapshot();
});

test('setStrategySortOrderSchema no additional parameters', () => {
    expect(
        validateSchema('#/components/schemas/setStrategySortOrderSchema', [
            { id: 'strategy-1', sortOrder: 1 },
            { id: 'strategy-2', sortOrder: 2, extra: 'test' },
            { id: 'strategy-3', sortOrder: 3 },
        ]),
    ).toMatchSnapshot();
});
