import { FeatureLifecycleStageIcon } from './FeatureLifecycleStageIcon';
import { FeatureLifecycleTooltip } from './FeatureLifecycleTooltip';
import useFeatureLifecycleApi from 'hooks/api/actions/useFeatureLifecycleApi/useFeatureLifecycleApi';
import { populateCurrentStage } from './populateCurrentStage';
import { type FC, useState } from 'react';
import type { Lifecycle } from 'interfaces/featureToggle';
import { MarkCompletedDialogue } from './MarkCompletedDialogue';

export interface LifecycleFeature {
    lifecycle?: Lifecycle;
    project: string;
    name: string;
    environments?: Array<{
        type: string;
        name: string;
        lastSeenAt?: string | null;
    }>;
}

export const FeatureLifecycle: FC<{
    onArchive: () => void;
    onComplete: () => void;
    onUncomplete: () => void;
    feature: LifecycleFeature;
}> = ({ feature, onComplete, onUncomplete, onArchive }) => {
    const [showMarkCompletedDialogue, setShowMarkCompletedDialogue] =
        useState(false);
    const currentStage = populateCurrentStage(feature);

    const { markFeatureUncompleted, loading } = useFeatureLifecycleApi();

    const onUncompleteHandler = async () => {
        await markFeatureUncompleted(feature.name, feature.project);
        onUncomplete();
    };

    return currentStage ? (
        <>
            <FeatureLifecycleTooltip
                stage={currentStage!}
                onArchive={onArchive}
                onComplete={() => setShowMarkCompletedDialogue(true)}
                onUncomplete={onUncompleteHandler}
                loading={loading}
            >
                <FeatureLifecycleStageIcon stage={currentStage!} />
            </FeatureLifecycleTooltip>
            <MarkCompletedDialogue
                isOpen={showMarkCompletedDialogue}
                setIsOpen={setShowMarkCompletedDialogue}
                projectId={feature.project}
                featureId={feature.name}
                onComplete={onComplete}
            />
        </>
    ) : null;
};
