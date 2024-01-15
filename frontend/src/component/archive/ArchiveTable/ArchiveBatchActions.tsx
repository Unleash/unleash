import { FC, useState } from 'react';
import { Button } from '@mui/material';
import { Delete, Undo } from '@mui/icons-material';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import { useFeaturesArchive } from 'hooks/api/getters/useFeaturesArchive/useFeaturesArchive';
import { ArchivedFeatureDeleteConfirm } from './ArchivedFeatureActionCell/ArchivedFeatureDeleteConfirm/ArchivedFeatureDeleteConfirm';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { ArchivedFeatureReviveConfirm } from './ArchivedFeatureActionCell/ArchivedFeatureReviveConfirm/ArchivedFeatureReviveConfirm';

interface IArchiveBatchActionsProps {
    selectedIds: string[];
    projectId: string;
    onConfirm?: () => void;
}

export const ArchiveBatchActions: FC<IArchiveBatchActionsProps> = ({
    selectedIds,
    projectId,
    onConfirm,
}) => {
    const { refetchArchived } = useFeaturesArchive(projectId);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reviveModalOpen, setReviveModalOpen] = useState(false);
    const { trackEvent } = usePlausibleTracker();

    const onRevive = async () => {
        setReviveModalOpen(true);
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
                        variant='outlined'
                        size='small'
                        onClick={onRevive}
                        date-testid={'batch_revive'}
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
                        variant='outlined'
                        size='small'
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
                    onConfirm?.();
                    trackEvent('batch_operations', {
                        props: {
                            eventType: 'features deleted',
                        },
                    });
                }}
            />
            <ArchivedFeatureReviveConfirm
                revivedFeatures={selectedIds}
                projectId={projectId}
                open={reviveModalOpen}
                setOpen={setReviveModalOpen}
                refetch={() => {
                    refetchArchived();
                    onConfirm?.();
                    trackEvent('batch_operations', {
                        props: {
                            eventType: 'features revived',
                        },
                    });
                }}
            />
        </>
    );
};
