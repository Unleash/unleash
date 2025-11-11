import type { Variant } from 'unleash-client';

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

export function parseEnvVarJSON(
    envVar: string | undefined,
    defaultVal: Record<string, unknown>,
): Record<string, unknown> {
    if (envVar) {
        try {
            return JSON.parse(envVar);
        } catch (e) {
            return defaultVal;
        }
    }

    return defaultVal;
}

export function parseEnvVarBooleanOrVariant(
    envVar: string | undefined,
    defaultVal: boolean | Variant,
): boolean | Variant {
    if (!envVar) {
        return defaultVal;
    }

    if (envVar === '1' || envVar === 't') {
        return true;
    }

    if (envVar === '0' || envVar === 'f') {
        return false;
    }

    try {
        const parsed = JSON.parse(envVar);
        if ('name' in parsed && 'enabled' in parsed) {
            return parsed as Variant;
        }
    } catch (e) {
        // ... do nothing?
    }
    return defaultVal;
}
