import { validateSchema } from '../validate';
import { ContextFieldSchema } from './context-field-schema';

test('contextFieldSchema', () => {
    const data: ContextFieldSchema = {
        name: '',
        description: '',
        stickiness: false,
        sortOrder: 0,
        legalValues: [],
    };

    expect(
        validateSchema('#/components/schemas/contextFieldSchema', data),
    ).toBeUndefined();
});

test('contextFieldSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/contextFieldSchema', {}),
    ).toMatchSnapshot();
});
