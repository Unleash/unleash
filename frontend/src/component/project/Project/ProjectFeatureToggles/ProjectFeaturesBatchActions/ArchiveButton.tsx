import { useState, VFC } from 'react';
import { Button } from '@mui/material';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import { DELETE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useProject from 'hooks/api/getters/useProject/useProject';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

interface IArchiveButtonProps {
    projectId: string;
    features: string[];
}

export const ArchiveButton: VFC<IArchiveButtonProps> = ({
    projectId,
    features,
}) => {
    const { refetch } = useProject(projectId);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { trackEvent } = usePlausibleTracker();

    const onConfirm = async () => {
        setIsDialogOpen(false);
        await refetch();
        trackEvent('batch_operations', {
            props: {
                eventType: 'features archived',
            },
        });
    };

    return (
        <>
            <PermissionHOC projectId={projectId} permission={DELETE_FEATURE}>
                {({ hasAccess }) => (
                    <Button
                        disabled={!hasAccess || isDialogOpen}
                        variant="outlined"
                        size="small"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        Archive
                    </Button>
                )}
            </PermissionHOC>
            <FeatureArchiveDialog
                projectId={projectId}
                featureIds={features}
                onConfirm={onConfirm}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </>
    );
};
