import { ApiTokenType } from '../../types/model.js';
import { validateSchema } from '../validate.js';
import type { ApiTokenSchema } from './api-token-schema.js';

const defaultData: ApiTokenSchema = {
    secret: '',
    tokenName: '',
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
