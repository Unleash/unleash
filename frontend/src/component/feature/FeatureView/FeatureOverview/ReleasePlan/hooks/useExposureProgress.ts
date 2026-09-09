import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics.ts';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam.ts';
import {
    type ExposureProgressInfo,
    isExposureCondition,
} from 'interfaces/releasePlans';
import type { TransitionConditionSchema } from 'openapi';

export const useExposureProgress = ({
    condition,
    environment,
    featureName,
}: {
    condition: TransitionConditionSchema;
    environment: string;
    featureName: string;
}): ExposureProgressInfo | undefined => {
    const projectId = useRequiredPathParam('projectId');
    const { metrics } = useFeatureMetrics(projectId, featureName);

    if (!isExposureCondition(condition) || metrics.totalUsage === undefined) {
        return undefined;
    }

    const exposures =
        metrics.totalUsage.find((usage) => usage.environment === environment)
            ?.yes ?? 0;

    return { exposures, target: condition.minimumExposures };
};
