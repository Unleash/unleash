import { useState } from 'react';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { MarkCompletedDialogue } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/MarkCompletedDialogue';

export const useRowActions = (onChange: () => void, projectId: string) => {
    const [featureArchiveState, setFeatureArchiveState] = useState<
        string | undefined
    >();

    const [featureStaleDialogState, setFeatureStaleDialogState] = useState<{
        featureId?: string;
        stale?: boolean;
    }>({});

    const [showMarkCompletedDialogue, setShowMarkCompletedDialogue] = useState<{
        featureId: string;
        open: boolean;
    }>({
        featureId: 'default',
        open: false,
    });
    const rowActionsDialogs = (
        <>
            <FeatureStaleDialog
                isStale={Boolean(featureStaleDialogState.stale)}
                isOpen={Boolean(featureStaleDialogState.featureId)}
                onClose={() => {
                    setFeatureStaleDialogState({});
                    onChange();
                }}
                featureId={featureStaleDialogState.featureId || ''}
                projectId={projectId}
            />

            <FeatureArchiveDialog
                isOpen={Boolean(featureArchiveState)}
                onConfirm={onChange}
                onClose={() => {
                    setFeatureArchiveState(undefined);
                }}
                featureIds={[featureArchiveState || '']}
                projectId={projectId}
            />
            <MarkCompletedDialogue
                isOpen={showMarkCompletedDialogue.open}
                setIsOpen={(open) => {
                    setShowMarkCompletedDialogue({
                        ...showMarkCompletedDialogue,
                        open,
                    });
                }}
                projectId={projectId}
                featureId={showMarkCompletedDialogue.featureId}
                onComplete={onChange}
            />
        </>
    );

    return {
        rowActionsDialogs,
        setFeatureArchiveState,
        setFeatureStaleDialogState,
        setShowMarkCompletedDialogue,
    };
};
