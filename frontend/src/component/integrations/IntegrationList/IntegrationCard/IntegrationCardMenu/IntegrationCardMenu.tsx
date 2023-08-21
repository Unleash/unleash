import { useState, VFC } from 'react';
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

interface IIntegrationCardMenuProps {
    id: string;
}

const StyledMenu = styled('div')(({ theme }) => ({
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    display: 'flex',
    alignItems: 'center',
}));

export const IntegrationCardMenu: VFC<IIntegrationCardMenuProps> = ({ id }) => {
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);

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
                // style={{ top: 0, left: -100 }}
                onClick={event => {
                    event.preventDefault();
                }}
                onClose={handleMenuClick}
            >
                <MenuItem
                    // onClick={e => {
                    //     e.preventDefault();
                    //     navigate(
                    //         getProjectEditPath(
                    //             id,
                    //             Boolean(
                    //                 uiConfig.flags
                    //                     .newProjectLayout
                    //             )
                    //         )
                    //     );
                    // }}
                    disabled={!updateAccess}
                >
                    <ListItemIcon>
                        <PowerSettingsNew />
                    </ListItemIcon>
                    <ListItemText>Disable</ListItemText>
                </MenuItem>{' '}
                <MenuItem
                    disabled={!deleteAccess}
                    // onClick={() => setRemoveDialogOpen(true)}
                >
                    <ListItemIcon>
                        <Delete />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
                {/* <MenuItem
                onClick={e => {
                    e.preventDefault();
                    setShowDelDialog(true);
                }}
                disabled={!canDeleteProject}
            >
                <StyledDeleteIcon />
                {id === DEFAULT_PROJECT_ID &&
                !canDeleteProject
                    ? "You can't delete the default project"
                    : 'Delete project'}
            </MenuItem> */}
            </Menu>
        </StyledMenu>
    );
};
