import { useState, VFC } from 'react';
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Popover,
    Tooltip,
    Typography,
} from '@mui/material';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { MoreVert, WatchLater } from '@mui/icons-material';

interface IMoreActionsProps {
    projectId: string;
}

const menuId = 'selection-actions-menu';

export const MoreActions: VFC<IMoreActionsProps> = ({ projectId }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title="Feature toggle actions" arrow describeChild>
                <IconButton
                    id={menuId}
                    aria-controls={open ? menuId : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    type="button"
                >
                    <MoreVert />
                </IconButton>
            </Tooltip>
            <Popover
                id={`${menuId}-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                disableScrollLock={true}
                PaperProps={{
                    sx: theme => ({
                        borderRadius: theme.shape.borderRadius,
                        padding: theme.spacing(1, 1.5),
                    }),
                }}
            >
                <MenuList aria-labelledby={`${menuId}-menu`}>
                    <PermissionHOC
                        projectId={projectId}
                        permission={UPDATE_FEATURE}
                    >
                        {({ hasAccess }) => (
                            <>
                                <MenuItem
                                    // sx={defaultBorderRadius}
                                    // onClick={() => {
                                    //     handleClose();
                                    //     onOpenStaleDialog({
                                    //         featureId,
                                    //         stale: stale === true,
                                    //     });
                                    // }}
                                    disabled={!hasAccess}
                                >
                                    <ListItemIcon>
                                        <WatchLater />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body2">
                                            Mark as stale
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>
                                <MenuItem
                                    // sx={defaultBorderRadius}
                                    // onClick={() => {
                                    //     handleClose();
                                    //     onOpenStaleDialog({
                                    //         featureId,
                                    //         stale: stale === true,
                                    //     });
                                    // }}
                                    disabled={!hasAccess}
                                >
                                    <ListItemIcon>
                                        <WatchLater />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body2">
                                            Un-mark as stale
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>
                            </>
                        )}
                    </PermissionHOC>
                </MenuList>
            </Popover>
        </>
    );
};
