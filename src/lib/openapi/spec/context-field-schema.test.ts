import { validateSchema } from '../validate';
import { ContextFieldSchema } from './context-field-schema';

test('contextFieldSchema', () => {
    const data: ContextFieldSchema = {
        name: '',
        description: '',
        stickiness: false,
        sortOrder: 0,
        createdAt: '2022-01-01T00:00:00.000Z',
        legalValues: [
            { value: 'a' },
            { value: 'b', description: '' },
            { value: 'c', description: 'd' },
        ],
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
