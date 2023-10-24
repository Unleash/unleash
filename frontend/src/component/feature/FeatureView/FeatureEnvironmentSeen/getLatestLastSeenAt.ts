import { IEnvironments, IFeatureEnvironment } from 'interfaces/featureToggle';

export const getLatestLastSeenAt = (
    environments: IEnvironments[] | IFeatureEnvironment[],
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
    } catch (error) {
        return null;
    }
};
