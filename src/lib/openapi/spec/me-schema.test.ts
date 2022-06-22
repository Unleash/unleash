import { validateSchema } from '../validate';
import { MeSchema } from './me-schema';

test('meSchema', () => {
    const data: MeSchema = {
        user: { id: 1 },
        permissions: [{ permission: 'a' }],
        feedback: [{ userId: 1, feedbackId: 'a', neverShow: false }],
        splash: { a: true },
    };

    expect(
        validateSchema('#/components/schemas/meSchema', data),
    ).toBeUndefined();
});

test('meSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/meSchema', {}),
    ).toMatchSnapshot();
});

test('meSchema missing permissions', () => {
    expect(
        validateSchema('#/components/schemas/meSchema', { user: { id: 1 } }),
    ).toMatchSnapshot();
});

test('meSchema missing splash', () => {
    expect(
        validateSchema('#/components/schemas/meSchema', {
            user: { id: 1 },
            permissions: [],
            feedback: [],
        }),
    ).toMatchSnapshot();
});
