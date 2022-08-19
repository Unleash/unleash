import { ApiTokenType } from '../../types/models/api-token';
import { validateSchema } from '../validate';
import { ApiTokenSchema } from './api-token-schema';

const defaultData: ApiTokenSchema = {
    secret: '',
    username: '',
    type: ApiTokenType.CLIENT,
    environment: '',
    projects: [],
    expiresAt: '2022-01-01T00:00:00.000Z',
    createdAt: '2022-01-01T00:00:00.000Z',
    seenAt: '2022-01-01T00:00:00.000Z',
    project: '',
};

test('apiTokenSchema', () => {
    const data: ApiTokenSchema = { ...defaultData };

    expect(
        validateSchema('#/components/schemas/apiTokenSchema', data),
    ).toBeUndefined();
});

test('apiTokenSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/apiTokenSchema', {}),
    ).toMatchSnapshot();
});
