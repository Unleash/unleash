import { useState } from 'react';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';

export const useRowActions = (onChange: () => void, projectId: string) => {
    const [featureArchiveState, setFeatureArchiveState] = useState<
        string | undefined
    >();

    const [featureStaleDialogState, setFeatureStaleDialogState] = useState<{
        featureId?: string;
        stale?: boolean;
    }>({});

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
        </>
    );

    return {
        rowActionsDialogs,
        setFeatureArchiveState,
        setFeatureStaleDialogState,
    };
};
