import { FeatureLifecycleStageIcon } from './FeatureLifecycleStageIcon';
import { FeatureLifecycleTooltip } from './FeatureLifecycleTooltip';
import useFeatureLifecycleApi from 'hooks/api/actions/useFeatureLifecycleApi/useFeatureLifecycleApi';
import { populateCurrentStage } from './populateCurrentStage';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import type { FC } from 'react';

export const FeatureLifecycle: FC<{
    onArchive: () => void;
    onComplete: () => void;
    onUncomplete: () => void;
    feature: Pick<
        IFeatureToggle,
        'lifecycle' | 'environments' | 'project' | 'name'
    >;
}> = ({ feature, onComplete, onUncomplete, onArchive }) => {
    const currentStage = populateCurrentStage(feature);

    const { markFeatureCompleted, markFeatureUncompleted, loading } =
        useFeatureLifecycleApi();

    const onCompleteHandler = async () => {
        await markFeatureCompleted(feature.name, feature.project);
        onComplete();
    };

    const onUncompleteHandler = async () => {
        await markFeatureUncompleted(feature.name, feature.project);
        onUncomplete();
    };

    return currentStage ? (
        <FeatureLifecycleTooltip
            stage={currentStage!}
            onArchive={onArchive}
            onComplete={onCompleteHandler}
            onUncomplete={onUncompleteHandler}
            loading={loading}
        >
            <FeatureLifecycleStageIcon stage={currentStage!} />
        </FeatureLifecycleTooltip>
    ) : null;
};
