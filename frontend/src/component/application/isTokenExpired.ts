import type { ApiTokenSchema } from 'openapi';

export const isTokenExpired = ({
    expiresAt,
}: Pick<ApiTokenSchema, 'expiresAt'>) =>
    expiresAt ? new Date(expiresAt) < new Date() : false;
