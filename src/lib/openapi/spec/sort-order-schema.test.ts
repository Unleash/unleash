import { validateSchema } from '../validate';
import { SortOrderSchema } from './sort-order-schema';

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
