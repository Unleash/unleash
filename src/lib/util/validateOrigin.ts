export const validateOrigin = (origin: string | undefined): boolean => {
    if (origin === undefined) {
        return false;
    }
    if (origin === '*') {
        return true;
    }

    if (origin?.includes('*')) {
        return false;
    }

    try {
        const parsed = new URL(origin);
        return typeof parsed.origin === 'string' && parsed.origin === origin;
    } catch {
        return false;
    }
};

export const validateOrigins = (origins: string[]): string | undefined => {
    for (const origin of origins) {
        if (!validateOrigin(origin)) {
            return `Invalid origin: ${origin}`;
        }
    }
};
