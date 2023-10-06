import { Logger } from '../../../logger';
import { IFeatureOverview } from '../../../types';
import { IFeatureLastSeenResults } from './last-seen-read-model';

export class LastSeenMapper {
    mapToFeatures(
        features: IFeatureOverview[],
        lastSeenAtPerEnvironment: IFeatureLastSeenResults,
        logger: Logger,
    ): IFeatureOverview[] {
        return features.map((feature) => {
            if (!feature.environments) {
                logger.warn('Feature without environments:', feature);
                return feature;
            }

            feature.environments = feature.environments.map((environment) => {
                const noData =
                    !lastSeenAtPerEnvironment[feature.name] ||
                    !lastSeenAtPerEnvironment[feature.name][environment.name];

                if (noData) {
                    logger.warn(
                        'No last seen data for environment:',
                        environment,
                    );
                    return environment;
                }

                environment.lastSeenAt = new Date(
                    lastSeenAtPerEnvironment[feature.name][environment.name]
                        .lastSeen,
                );
                return environment;
            });
            return feature;
        });
    }
}
