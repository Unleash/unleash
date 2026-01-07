import { randomUUID } from 'node:crypto';

export const randomId = (): string => {
    return randomUUID();
};
