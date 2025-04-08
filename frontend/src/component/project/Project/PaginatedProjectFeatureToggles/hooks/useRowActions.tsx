import { useState } from 'react';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { MarkCompletedDialogue } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/MarkCompletedDialogue';
import { ArchivedFeatureDeleteConfirm } from '../../../../archive/ArchiveTable/ArchivedFeatureActionCell/ArchivedFeatureDeleteConfirm/ArchivedFeatureDeleteConfirm';
import { ArchivedFeatureReviveConfirm } from '../../../../archive/ArchiveTable/ArchivedFeatureActionCell/ArchivedFeatureReviveConfirm/ArchivedFeatureReviveConfirm';

export const useRowActions = (onChange: () => void) => {
    const [featureArchiveState, setFeatureArchiveState] = useState<{
        featureId: string;
        projectId: string;
    }>();

    const [featureStaleDialogState, setFeatureStaleDialogState] = useState<{
        featureId: string;
        projectId: string;
        stale: boolean;
    }>();

    const [showMarkCompletedDialogue, setShowMarkCompletedDialogue] = useState<{
        featureId: string;
        projectId: string;
    }>();

    const [showFeatureReviveDialogue, setShowFeatureReviveDialogue] = useState<{
        featureId: string;
        projectId: string;
    }>();

    const [showFeatureDeleteDialogue, setShowFeatureDeleteDialogue] = useState<{
        featureId: string;
        projectId: string;
    }>();

    const rowActionsDialogs = (
        <>
            <FeatureStaleDialog
                isStale={Boolean(featureStaleDialogState?.stale)}
                isOpen={Boolean(featureStaleDialogState)}
                onClose={() => {
                    setFeatureStaleDialogState(undefined);
                    onChange();
                }}
                featureId={featureStaleDialogState?.featureId || ''}
                projectId={featureStaleDialogState?.projectId || ''}
            />
            <FeatureArchiveDialog
                isOpen={Boolean(featureArchiveState)}
                onConfirm={onChange}
                onClose={() => {
                    setFeatureArchiveState(undefined);
                }}
                featureIds={[featureArchiveState?.featureId || '']}
                projectId={featureArchiveState?.projectId || ''}
            />
            <MarkCompletedDialogue
                isOpen={Boolean(showMarkCompletedDialogue)}
                setIsOpen={(open) => {
                    setShowMarkCompletedDialogue(
                        open ? showMarkCompletedDialogue : undefined,
                    );
                }}
                projectId={showMarkCompletedDialogue?.projectId || ''}
                featureId={showMarkCompletedDialogue?.featureId || ''}
                onComplete={onChange}
            />
            <ArchivedFeatureDeleteConfirm
                deletedFeatures={[showFeatureDeleteDialogue?.featureId || '']}
                projectId={showFeatureDeleteDialogue?.projectId || ''}
                open={Boolean(showFeatureDeleteDialogue)}
                setOpen={(open) => {
                    setShowFeatureDeleteDialogue(
                        open ? showFeatureDeleteDialogue : undefined,
                    );
                }}
                refetch={onChange}
            />
            <ArchivedFeatureReviveConfirm
                revivedFeatures={[showFeatureReviveDialogue?.featureId || '']}
                projectId={showFeatureReviveDialogue?.projectId || ''}
                open={Boolean(showFeatureReviveDialogue)}
                setOpen={(open) => {
                    setShowFeatureReviveDialogue(
                        open ? showFeatureReviveDialogue : undefined,
                    );
                }}
                refetch={() => {
                    setShowFeatureReviveDialogue(undefined);
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
