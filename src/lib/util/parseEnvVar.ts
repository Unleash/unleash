export function parseEnvVarNumber(
    envVar: string | undefined,
    defaultVal: number,
): number {
    if (!envVar) {
        return defaultVal;
    }
    const parsed = Number.parseInt(envVar, 10);

    if (Number.isNaN(parsed)) {
        return defaultVal;
    }

    return parsed;
}

export function parseEnvVarBoolean(
    envVar: string | undefined,
    defaultVal: boolean,
): boolean {
    if (envVar) {
        return envVar === 'true' || envVar === '1' || envVar === 't';
    }

    return defaultVal;
}

export function parseEnvVarStrings(
    envVar: string | undefined,
    defaultVal: string[],
): string[] {
    if (typeof envVar === 'string') {
        return envVar
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return defaultVal;
}
