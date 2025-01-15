import { FeatureLifecycleStageIcon } from '../../../../common/FeatureLifecycle/FeatureLifecycleStageIcon';
import { FeatureLifecycleTooltip as LegacyFeatureLifecycleTooltip } from './LegacyFeatureLifecycleTooltip';
import { FeatureLifecycleTooltip } from './FeatureLifecycleTooltip';
import useFeatureLifecycleApi from 'hooks/api/actions/useFeatureLifecycleApi/useFeatureLifecycleApi';
import { populateCurrentStage } from './populateCurrentStage';
import type { FC } from 'react';
import type { Lifecycle } from 'interfaces/featureToggle';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useUiFlag } from 'hooks/useUiFlag';

export interface LifecycleFeature {
    lifecycle?: Lifecycle;
    project: string;
    name: string;
    environments?: Array<{
        type: string;
        name: string;
        lastSeenAt?: string | null;
        enabled: boolean;
    }>;
}

export const FeatureLifecycle: FC<{
    onArchive: () => void;
    onComplete: () => void;
    onUncomplete: () => void;
    feature: LifecycleFeature;
}> = ({ feature, onComplete, onUncomplete, onArchive }) => {
    const currentStage = populateCurrentStage(feature);
    const { markFeatureUncompleted, loading } = useFeatureLifecycleApi();
    const { trackEvent } = usePlausibleTracker();
    const isLifecycleImprovementsEnabled = useUiFlag('lifecycleImprovements');

    const onUncompleteHandler = async () => {
        await markFeatureUncompleted(feature.name, feature.project);
        onUncomplete();
        trackEvent('feature-lifecycle', {
            props: {
                eventType: 'uncomplete',
            },
        });
    };

    if (isLifecycleImprovementsEnabled) {
        return currentStage ? (
            <FeatureLifecycleTooltip
                stage={currentStage!}
                project={feature.project}
                onArchive={onArchive}
                onComplete={onComplete}
                onUncomplete={onUncompleteHandler}
                loading={loading}
            >
                <FeatureLifecycleStageIcon stage={currentStage} />
            </FeatureLifecycleTooltip>
        ) : null;
    }

    return currentStage ? (
        <LegacyFeatureLifecycleTooltip
            stage={currentStage!}
            project={feature.project}
            onArchive={onArchive}
            onComplete={onComplete}
            onUncomplete={onUncompleteHandler}
            loading={loading}
        >
            <FeatureLifecycleStageIcon stage={currentStage} />
        </LegacyFeatureLifecycleTooltip>
    ) : null;
};
