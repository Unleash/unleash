import { useCallback, useState, type VFC } from 'react';
import {
    Alert,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    styled,
    Tooltip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import Delete from '@mui/icons-material/Delete';
import PowerSettingsNew from '@mui/icons-material/PowerSettingsNew';
import {
    ADMIN,
    DELETE_ADDON,
    UPDATE_ADDON,
} from 'component/providers/AccessProvider/permissions';
import { useHasRootAccess } from 'hooks/useHasAccess';
import useAddonsApi from 'hooks/api/actions/useAddonsApi/useAddonsApi';
import type { AddonSchema } from 'openapi';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Visibility from '@mui/icons-material/Visibility';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import { IntegrationEventsModal } from 'component/integrations/IntegrationEvents/IntegrationEventsModal';

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isToggleOpen, setIsToggleOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const { updateAddon, removeAddon } = useAddonsApi();
    const { refetchAddons } = useAddons();
    const { setToastData, setToastApiError } = useToast();
    const [eventsModalOpen, setEventsModalOpen] = useState(false);

    const closeMenu = () => {
        setIsMenuOpen(false);
        setAnchorEl(null);
    };

    const handleMenuClick = (event: React.SyntheticEvent) => {
        if (isMenuOpen) {
            closeMenu();
        } else {
            setAnchorEl(event.currentTarget);
            setIsMenuOpen(true);
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
        <StyledMenu onClick={(e) => e.preventDefault()}>
            <Tooltip title='More actions' arrow>
                <IconButton
                    onClick={handleMenuClick}
                    size='small'
                    aria-controls={isMenuOpen ? 'actions-menu' : undefined}
                    aria-haspopup='true'
                    aria-expanded={isMenuOpen ? 'true' : undefined}
                    data-loading
                >
                    <MoreVertIcon sx={{ width: 32, height: 32 }} />
                </IconButton>
            </Tooltip>
            <Menu
                id='project-card-menu'
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
                onClose={handleMenuClick}
            >
                <PermissionHOC permission={ADMIN}>
                    {({ hasAccess }) => (
                        <MenuItem
                            onClick={() => setEventsModalOpen(true)}
                            disabled={!hasAccess}
                        >
                            <ListItemIcon>
                                <Visibility />
                            </ListItemIcon>
                            <ListItemText>View events</ListItemText>
                        </MenuItem>
                    )}
                </PermissionHOC>
                <MenuItem
                    onClick={() => {
                        setIsToggleOpen(true);
                        closeMenu();
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
                    onClick={() => {
                        setIsDeleteOpen(true);
                        closeMenu();
                    }}
                >
                    <ListItemIcon>
                        <Delete />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            <IntegrationEventsModal
                addon={addon}
                open={eventsModalOpen}
                setOpen={setEventsModalOpen}
            />
            <Dialogue
                open={isToggleOpen}
                onClick={toggleIntegration}
                onClose={() => setIsToggleOpen(false)}
                title={
                    addon.enabled
                        ? `Disable integration?`
                        : `Enable integration?`
                }
            >
                <div>
                    {addon.enabled ? 'Disabling' : 'Enabling'} this integration
                    will{' '}
                    {addon.enabled
                        ? 'prevent it from sending updates'
                        : 'allow it to send updates'}
                </div>
            </Dialogue>
            <Dialogue
                open={isDeleteOpen}
                onClick={deleteIntegration}
                onClose={() => setIsDeleteOpen(false)}
                title='Delete integration?'
            >
                <Alert severity='warning'>
                    Deleting this integration instance will delete all its
                    configuration. It will stop working immediately.
                </Alert>
            </Dialogue>
        </StyledMenu>
    );
};
