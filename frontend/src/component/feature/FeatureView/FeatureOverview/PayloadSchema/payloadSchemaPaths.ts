import { formatFeaturePath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';

export const formatPayloadSchemaPath = (
    projectId: string,
    featureId: string,
): string => `${formatFeaturePath(projectId, featureId)}/payload-schema`;
