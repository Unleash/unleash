import { basePath } from './formatPath.js';

export const toLocalStorageName = (key: string): string =>
    `${basePath}:${key}:localStorage:v2`;
