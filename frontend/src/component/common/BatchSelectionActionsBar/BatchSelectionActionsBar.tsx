import { FC, useMemo, useState, VFC } from 'react';
import { Box, Button, Paper, styled, Typography } from '@mui/material';
import { FileDownload, Label, WatchLater } from '@mui/icons-material';
import type { FeatureSchema } from '../../../openapi';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';
import { ExportDialog } from '../../feature/FeatureToggleList/ExportDialog';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import { ArchiveButton } from '../../project/Project/ProjectFeatureToggles/SelectionActionsBar/ArchiveButton/ArchiveButton';
import { MoreActions } from '../../project/Project/ProjectFeatureToggles/SelectionActionsBar/MoreActions/MoreActions';

interface IBatchSelectionActionsBarProps {
    selectedIds: string[];
}

const StyledContainer = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
}));

const StyledBar = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: theme.shape.borderRadiusLarge,
    gap: theme.spacing(1),
    flexWrap: 'wrap',
}));

const StyledCount = styled('span')(({ theme }) => ({
    background: theme.palette.secondary.main,
    color: theme.palette.background.paper,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
}));

const StyledText = styled(Typography)(({ theme }) => ({
    paddingRight: theme.spacing(2),
    marginRight: 'auto',
}));

export const BatchSelectionActionsBar: FC<IBatchSelectionActionsBarProps> = ({
    selectedIds,
    children,
}) => {
    if (selectedIds.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            <StyledBar elevation={4}>
                <StyledText>
                    <StyledCount>{selectedIds.length}</StyledCount>
                    &ensp;selected
                </StyledText>
                {children}
            </StyledBar>
        </StyledContainer>
    );
};
