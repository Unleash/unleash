const FALLBACK_INSTANCE_NAME = 'Unleash';

export const getInstanceName = (unleashUrl?: string): string => {
    if (!unleashUrl) {
        return FALLBACK_INSTANCE_NAME;
    }

    try {
        const segments = new URL(unleashUrl).pathname
            .split('/')
            .filter(Boolean);
        return segments.at(-1) ?? FALLBACK_INSTANCE_NAME;
    } catch {
        return FALLBACK_INSTANCE_NAME;
    }
};
