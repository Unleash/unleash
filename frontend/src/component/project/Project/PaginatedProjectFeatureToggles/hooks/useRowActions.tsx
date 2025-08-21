import { useState } from 'react';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { MarkCompletedDialogue } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/MarkCompletedDialogue';
import { ArchivedFeatureDeleteConfirm } from '../../../../archive/ArchiveTable/ArchivedFeatureActionCell/ArchivedFeatureDeleteConfirm/ArchivedFeatureDeleteConfirm.tsx';
import { ArchivedFeatureReviveConfirm } from '../../../../archive/ArchiveTable/ArchivedFeatureActionCell/ArchivedFeatureReviveConfirm/ArchivedFeatureReviveConfirm.tsx';

export const useRowActions = (
    onChange: () => void,
    projectId: string,
    onArchiveConfirm?: () => void,
) => {
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
    const [showFeatureReviveDialogue, setShowFeatureReviveDialogue] = useState<{
        featureId: string;
        open: boolean;
    }>({
        featureId: 'default',
        open: false,
    });
    const [showFeatureDeleteDialogue, setShowFeatureDeleteDialogue] = useState<{
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
                onConfirm={() => {
                    onChange();
                    onArchiveConfirm?.();
                }}
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
            <ArchivedFeatureDeleteConfirm
                deletedFeatures={[showFeatureDeleteDialogue.featureId]}
                projectId={projectId}
                open={showFeatureDeleteDialogue.open}
                setOpen={(open) => {
                    setShowFeatureDeleteDialogue((prev) => ({
                        ...prev,
                        open,
                    }));
                }}
                refetch={onChange}
            />
            <ArchivedFeatureReviveConfirm
                revivedFeatures={[showFeatureReviveDialogue.featureId]}
                projectId={projectId}
                open={showFeatureReviveDialogue.open}
                setOpen={(open) => {
                    setShowFeatureReviveDialogue((prev) => ({
                        ...prev,
                        open,
                    }));
                }}
                refetch={() => {
                    setShowFeatureReviveDialogue((prev) => ({
                        ...prev,
                        open: false,
                    }));
                    onChange();
                }}
            />
        </>
    );

    return {
        rowActionsDialogs,
        setFeatureArchiveState,
        setFeatureStaleDialogState,
        setShowMarkCompletedDialogue,
        setShowFeatureReviveDialogue,
        setShowFeatureDeleteDialogue,
    };
};
