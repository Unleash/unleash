import { type FC, useState } from 'react';
import { Button } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Undo from '@mui/icons-material/Undo';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import { ArchivedFeatureDeleteConfirm } from './ArchivedFeatureActionCell/ArchivedFeatureDeleteConfirm/ArchivedFeatureDeleteConfirm.tsx';
import { useEventTracker } from 'hooks/useEventTracker';
import { ArchivedFeatureReviveConfirm } from './ArchivedFeatureActionCell/ArchivedFeatureReviveConfirm/ArchivedFeatureReviveConfirm.tsx';

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
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reviveModalOpen, setReviveModalOpen] = useState(false);
    const { trackEvent } = useEventTracker();

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
                        size='medium'
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
                        size='medium'
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
