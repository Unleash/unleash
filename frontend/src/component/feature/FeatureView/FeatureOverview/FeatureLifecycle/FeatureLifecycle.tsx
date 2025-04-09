import { FeatureLifecycleStageIcon } from 'component/common/FeatureLifecycle/FeatureLifecycleStageIcon';
import { FeatureLifecycleTooltip } from './FeatureLifecycleTooltip';
import useFeatureLifecycleApi from 'hooks/api/actions/useFeatureLifecycleApi/useFeatureLifecycleApi';
import { populateCurrentStage } from './populateCurrentStage';
import type { FC } from 'react';
import type { Lifecycle } from 'interfaces/featureToggle';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { getFeatureLifecycleName } from 'component/common/FeatureLifecycle/getFeatureLifecycleName';
import { Box } from '@mui/material';

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
    onArchive?: () => void;
    onComplete?: () => void;
    onUncomplete?: () => void;
    feature: LifecycleFeature;
    expanded?: boolean;
}> = ({ feature, expanded, onComplete, onUncomplete, onArchive }) => {
    const currentStage = populateCurrentStage(feature);
    const { markFeatureUncompleted, loading } = useFeatureLifecycleApi();
    const { trackEvent } = usePlausibleTracker();

    const onUncompleteHandler = async () => {
        await markFeatureUncompleted(feature.name, feature.project);
        onUncomplete?.();
        trackEvent('feature-lifecycle', {
            props: {
                eventType: 'uncomplete',
            },
        });
    };

    return currentStage ? (
        <Box sx={(theme) => ({ display: 'flex', gap: theme.spacing(0.5) })}>
            <FeatureLifecycleTooltip
                stage={currentStage!}
                project={feature.project}
                onArchive={onArchive}
                onComplete={onComplete}
                onUncomplete={onUncomplete ? onUncompleteHandler : undefined}
                loading={loading}
            >
                <FeatureLifecycleStageIcon stage={currentStage} />
            </FeatureLifecycleTooltip>{' '}
            <p>
                {expanded ? getFeatureLifecycleName(currentStage.name) : null}
            </p>
        </Box>
    ) : null;
};
