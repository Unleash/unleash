import type { ILastSeenEnvironments } from 'interfaces/featureToggle';

export const getLatestLastSeenAt = (
    environments: ILastSeenEnvironments[],
): string | null => {
    try {
        if (!Array.isArray(environments) || environments.length === 0) {
            return null;
        }

        return environments
            .filter((item) => Boolean(item.lastSeenAt))
            .map((item) => new Date(item.lastSeenAt!))
            .reduce((latest, current) => (current > latest ? current : latest))
            .toISOString();
    } catch (_error) {
        return null;
    }
};
