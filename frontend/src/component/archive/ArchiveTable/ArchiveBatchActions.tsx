import { FC, MouseEventHandler, useMemo, useState, VFC } from 'react';
import { Box, Button, Paper, styled, Typography } from '@mui/material';
import {
    Archive,
    FileDownload,
    Label,
    Undo,
    WatchLater,
} from '@mui/icons-material';
import type { FeatureSchema } from 'openapi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionIconButton from '../../common/PermissionIconButton/PermissionIconButton';
import {
    CREATE_ADDON,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from '../../providers/AccessProvider/permissions';
import PermissionButton from '../../common/PermissionButton/PermissionButton';
import { PermissionHOC } from '../../common/PermissionHOC/PermissionHOC';
import useProjectApi from '../../../hooks/api/actions/useProjectApi/useProjectApi';
import { formatUnknownError } from '../../../utils/formatUnknownError';
import { useFeaturesArchive } from '../../../hooks/api/getters/useFeaturesArchive/useFeaturesArchive';
import useToast from '../../../hooks/useToast';

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
