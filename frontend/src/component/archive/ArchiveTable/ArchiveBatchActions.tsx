import { FC, useState } from 'react';
import { Button } from '@mui/material';
import { Delete, Undo } from '@mui/icons-material';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useFeaturesArchive } from 'hooks/api/getters/useFeaturesArchive/useFeaturesArchive';
import useToast from 'hooks/useToast';
import { ArchivedFeatureDeleteConfirm } from './ArchivedFeatureActionCell/ArchivedFeatureDeleteConfirm/ArchivedFeatureDeleteConfirm';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

interface IArchiveBatchActionsProps {
    selectedIds: string[];
    projectId: string;
}

export const ArchiveBatchActions: FC<IArchiveBatchActionsProps> = ({
    selectedIds,
    projectId,
}) => {
    const { reviveFeatures } = useProjectApi();
    const { setToastData, setToastApiError } = useToast();
    const { refetchArchived } = useFeaturesArchive(projectId);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const { trackEvent } = usePlausibleTracker();

    const onRevive = async () => {
        try {
            await reviveFeatures(projectId, selectedIds);
            await refetchArchived();
            setToastData({
                type: 'success',
                title: "And we're back!",
                text: 'The feature toggles have been revived.',
            });
            trackEvent('batch_operations', {
                props: {
                    eventType: 'features revived',
                },
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onDelete = async () => {
        setDeleteModalOpen(true);
    };
    return (
        <>
            <PermissionHOC projectId={projectId} permission={UPDATE_FEATURE}>
                {({ hasAccess }) => (
                    <Button
                        disabled={!hasAccess}
                        startIcon={<Undo />}
                        variant="outlined"
                        size="small"
                        onClick={onRevive}
                    >
                        Revive
                    </Button>
                )}
            </PermissionHOC>
            <PermissionHOC projectId={projectId} permission={DELETE_FEATURE}>
                {({ hasAccess }) => (
                    <Button
                        disabled={!hasAccess}
                        startIcon={<Delete />}
                        variant="outlined"
                        size="small"
                        onClick={onDelete}
                    >
                        Delete
                    </Button>
                )}
            </PermissionHOC>
            <ArchivedFeatureDeleteConfirm
                deletedFeatures={selectedIds}
                projectId={projectId}
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                refetch={() => {
                    refetchArchived();
                    trackEvent('batch_operations', {
                        props: {
                            eventType: 'features deleted',
                        },
                    });
                }}
            />
        </>
    );
};
