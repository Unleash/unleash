export const validateOrigin = (origin: string): boolean => {
    if (origin === '*') {
        return true;
    }

    if (origin?.includes('*')) {
        return false;
    }

    try {
        const parsed = new URL(origin);
        return parsed.origin && parsed.origin === origin;
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
