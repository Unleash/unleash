import { validateSchema } from '../validate';
import { ContextSchema } from './context-schema';

test('contextSchema', () => {
    const data: ContextSchema = {
        name: '',
        description: '',
        stickiness: false,
        sortOrder: 0,
        legalValues: [],
    };

    expect(
        validateSchema('#/components/schemas/contextSchema', data),
    ).toBeUndefined();
});

test('contextSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/contextSchema', {}),
    ).toMatchSnapshot();
});
