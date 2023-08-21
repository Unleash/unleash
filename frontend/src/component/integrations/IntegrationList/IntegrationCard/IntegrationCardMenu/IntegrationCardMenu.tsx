import { useCallback, useState, VFC } from 'react';
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    styled,
    Tooltip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { Delete, PowerSettingsNew } from '@mui/icons-material';
import {
    DELETE_ADDON,
    UPDATE_ADDON,
} from 'component/providers/AccessProvider/permissions';
import { useHasRootAccess } from 'hooks/useHasAccess';
import useAddonsApi from 'hooks/api/actions/useAddonsApi/useAddonsApi';
import type { AddonSchema } from 'openapi';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IIntegrationCardMenuProps {
    addon: AddonSchema;
}

const StyledMenu = styled('div')(({ theme }) => ({
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    display: 'flex',
    alignItems: 'center',
}));

export const IntegrationCardMenu: VFC<IIntegrationCardMenuProps> = ({
    addon,
}) => {
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const { updateAddon, removeAddon } = useAddonsApi();
    const { refetchAddons } = useAddons();
    const { setToastData, setToastApiError } = useToast();

    const handleMenuClick = (event: React.SyntheticEvent) => {
        event.preventDefault();
        if (open) {
            setOpen(false);
            setAnchorEl(null);
        } else {
            setAnchorEl(event.currentTarget);
            setOpen(true);
        }
    };
    const updateAccess = useHasRootAccess(UPDATE_ADDON);
    const deleteAccess = useHasRootAccess(DELETE_ADDON);

    const toggleIntegration = useCallback(async () => {
        try {
            await updateAddon({ ...addon, enabled: !addon.enabled });
            refetchAddons();
            setToastData({
                type: 'success',
                title: 'Success',
                text: !addon.enabled
                    ? 'Integration is now enabled'
                    : 'Integration is now disabled',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    }, [setToastApiError, refetchAddons, setToastData, updateAddon]);

    const deleteIntegration = useCallback(async () => {
        try {
            await removeAddon(addon.id);
            refetchAddons();
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Integration has been deleted',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    }, [setToastApiError, refetchAddons, setToastData, removeAddon]);

    return (
        <StyledMenu>
            <Tooltip title="More actions" arrow>
                <IconButton
                    onClick={handleMenuClick}
                    size="small"
                    aria-controls={open ? 'actions-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    data-loading
                >
                    <MoreVertIcon sx={{ width: 32, height: 32 }} />
                </IconButton>
            </Tooltip>
            <Menu
                id="project-card-menu"
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                onClick={event => {
                    event.preventDefault();
                }}
                onClose={handleMenuClick}
            >
                <MenuItem
                    onClick={e => {
                        e.preventDefault();
                        toggleIntegration();
                    }}
                    disabled={!updateAccess}
                >
                    <ListItemIcon>
                        <PowerSettingsNew />
                    </ListItemIcon>
                    <ListItemText>
                        {addon.enabled ? 'Disable' : 'Enable'}
                    </ListItemText>
                </MenuItem>{' '}
                <MenuItem
                    disabled={!deleteAccess}
                    onClick={e => {
                        e.preventDefault();
                        deleteIntegration();
                    }}
                >
                    <ListItemIcon>
                        <Delete />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>
        </StyledMenu>
    );
};
