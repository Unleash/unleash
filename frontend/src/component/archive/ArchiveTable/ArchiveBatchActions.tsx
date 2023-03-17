import { FC } from 'react';
import { Button } from '@mui/material';
import { Undo } from '@mui/icons-material';
import type { FeatureSchema } from 'openapi';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useFeaturesArchive } from 'hooks/api/getters/useFeaturesArchive/useFeaturesArchive';
import useToast from 'hooks/useToast';

interface IArchiveBatchActionsProps {
    selectedIds: string[];
    data: FeatureSchema[];
    projectId: string;
}

export const ArchiveBatchActions: FC<IArchiveBatchActionsProps> = ({
    selectedIds,
    data,
    projectId,
}) => {
    const { reviveFeatures } = useProjectApi();
    const { setToastData, setToastApiError } = useToast();
    const { refetchArchived } = useFeaturesArchive(projectId);

    const onRevive = async () => {
        try {
            await reviveFeatures(projectId, selectedIds);
            await refetchArchived();
            setToastData({
                type: 'success',
                title: "And we're back!",
                text: 'The feature toggles have been revived.',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
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
        </>
    );
};
