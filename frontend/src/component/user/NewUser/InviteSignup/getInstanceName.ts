const FALLBACK_INSTANCE_NAME = 'Unleash';

export const getInstanceName = (basePath: string): string =>
    basePath.split('/').filter(Boolean).at(-1) ?? FALLBACK_INSTANCE_NAME;
