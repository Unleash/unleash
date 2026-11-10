import type { IFeatureStrategy } from 'interfaces/strategy';
import { normalizeCustomContextProperties } from 'component/playground/Playground/playground.utils';

export const buildContextSeed = (
    strategies: IFeatureStrategy[] = [],
): string => {
    const contextNames = Array.from(
        new Set(
            strategies
                .flatMap((strategy) => strategy.constraints ?? [])
                .map((constraint) => constraint.contextName)
                .filter(
                    (contextName) =>
                        Boolean(contextName) && contextName !== 'appName',
                ),
        ),
    );

    if (contextNames.length === 0) {
        return '{}';
    }

    const raw = Object.fromEntries(
        contextNames.map((name) => [
            name,
            name === 'currentTime' ? new Date().toISOString() : '',
        ]),
    );

    return JSON.stringify(normalizeCustomContextProperties(raw), null, 2);
};
