import { validateSchema } from '../validate.js';
import type { SortOrderSchema } from './sort-order-schema.js';

test('sortOrderSchema', () => {
    const data: SortOrderSchema = {
        a: 1,
        b: 2,
    };

    expect(
        validateSchema('#/components/schemas/sortOrderSchema', data),
    ).toBeUndefined();
});

test('sortOrderSchema invalid value type', () => {
    expect(
        validateSchema('#/components/schemas/sortOrderSchema', { a: '1' }),
    ).toMatchSnapshot();
});
