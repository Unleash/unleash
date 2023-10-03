import React, { SyntheticEvent, useState } from 'react';
import {
    Box,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IFeatureStrategy } from 'interfaces/strategy';
import { DialogStrategyRemove } from './DialogStrategyRemove';
import { DisableEnableStrategyDialog } from './DisableEnableStrategyDialog/DisableEnableStrategyDialog';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import {
    DELETE_FEATURE_STRATEGY,
    UPDATE_FEATURE_STRATEGY,
} from '@server/types/permissions';
import { useHasProjectEnvironmentAccess } from 'hooks/useHasAccess';
import {
    MENU_STRATEGY_REMOVE,
    STRATEGY_FORM_REMOVE_ID,
    STRATEGY_REMOVE_MENU_BTN,
} from 'utils/testIds';

export interface IRemoveStrategyMenuProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategy: IFeatureStrategy;
}

const MenuStrategyRemove = ({
    projectId,
    strategy,
    featureId,
    environmentId,
}: IRemoveStrategyMenuProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isDisableEnableDialogOpen, setDisableEnableDialogOpen] =
        useState(false);
    const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (event: SyntheticEvent) => {
        setAnchorEl(null);
        event.stopPropagation();
    };
    const updateAccess = useHasProjectEnvironmentAccess(
        UPDATE_FEATURE_STRATEGY,
        projectId,
        environmentId
    );
    const deleteAccess = useHasProjectEnvironmentAccess(
        DELETE_FEATURE_STRATEGY,
        projectId,
        environmentId
    );

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                <Tooltip title="More actions">
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        aria-controls={open ? 'actions-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        data-testid={STRATEGY_REMOVE_MENU_BTN}
                    >
                        <MoreVertIcon sx={{ width: 32, height: 32 }} />
                    </IconButton>
                </Tooltip>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="actions-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                data-testid={MENU_STRATEGY_REMOVE}
            >
                <Tooltip
                    title={
                        strategy.disabled
                            ? 'Enable strategy'
                            : 'Disable strategy'
                    }
                    arrow
                    placement="left"
                >
                    <MenuItem
                        disabled={!updateAccess}
                        onClick={() => setDisableEnableDialogOpen(true)}
                    >
                        <ListItemIcon>
                            {strategy.disabled ? (
                                <TrackChangesIcon />
                            ) : (
                                <BlockIcon />
                            )}
                        </ListItemIcon>
                        <ListItemText>
                            {strategy.disabled ? 'Enable' : 'Disable'}
                        </ListItemText>
                    </MenuItem>
                </Tooltip>
                <Tooltip title="Remove strategy" arrow placement="left">
                    <MenuItem
                        disabled={!deleteAccess}
                        onClick={() => setRemoveDialogOpen(true)}
                        data-testid={STRATEGY_FORM_REMOVE_ID}
                    >
                        <ListItemIcon>
                            <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText>Remove</ListItemText>
                    </MenuItem>
                </Tooltip>
            </Menu>
            <DisableEnableStrategyDialog
                isOpen={isDisableEnableDialogOpen}
                onClose={() => setDisableEnableDialogOpen(false)}
                projectId={projectId}
                featureId={featureId}
                environmentId={environmentId}
                strategy={strategy}
            />
            <DialogStrategyRemove
                isOpen={isRemoveDialogOpen}
                onClose={() => setRemoveDialogOpen(false)}
                projectId={projectId}
                featureId={featureId}
                environmentId={environmentId}
                strategyId={strategy.id}
            />
        </>
    );
};

export default MenuStrategyRemove;
