import { type FC, useState } from 'react';
import Delete from '@mui/icons-material/Delete';
import Undo from '@mui/icons-material/Undo';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
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
            <PermissionButton
                permission={UPDATE_FEATURE}
                projectId={projectId}
                startIcon={<Undo />}
                variant='outlined'
                size='medium'
                onClick={onRevive}
                data-testid={'batch_revive'}
            >
                Revive
            </PermissionButton>
            <PermissionButton
                permission={DELETE_FEATURE}
                projectId={projectId}
                startIcon={<Delete />}
                variant='outlined'
                size='medium'
                onClick={onDelete}
            >
                Delete
            </PermissionButton>
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
