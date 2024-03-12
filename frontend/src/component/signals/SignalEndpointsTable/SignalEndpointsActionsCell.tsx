import { useState } from 'react';
import {
    Box,
    IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Popover,
    Tooltip,
    Typography,
    styled,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Visibility from '@mui/icons-material/Visibility';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { defaultBorderRadius } from 'themes/themeStyles';

const StyledBoxCell = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
});

interface ISignalEndpointsActionsCellProps {
    signalEndpointId: number;
    onCopyToClipboard: (event: React.SyntheticEvent) => void;
    onOpenSignals: (event: React.SyntheticEvent) => void;
    onEdit: (event: React.SyntheticEvent) => void;
    onDelete: (event: React.SyntheticEvent) => void;
}

export const SignalEndpointsActionsCell = ({
    signalEndpointId,
    onCopyToClipboard,
    onOpenSignals,
    onEdit,
    onDelete,
}: ISignalEndpointsActionsCellProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const id = `signal-endpoint-${signalEndpointId}-actions`;
    const menuId = `${id}-menu`;

    return (
        <StyledBoxCell>
            <Tooltip title='Signal endpoint actions' arrow describeChild>
                <IconButton
                    id={id}
                    data-loading
                    aria-controls={open ? menuId : undefined}
                    aria-haspopup='true'
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    type='button'
                >
                    <MoreVertIcon />
                </IconButton>
            </Tooltip>
            <Popover
                id={menuId}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                disableScrollLock={true}
                PaperProps={{
                    sx: (theme) => ({
                        borderRadius: `${theme.shape.borderRadius}px`,
                        padding: theme.spacing(1, 1.5),
                    }),
                }}
            >
                <MenuList aria-labelledby={id}>
                    <MenuItem
                        sx={defaultBorderRadius}
                        onClick={onCopyToClipboard}
                    >
                        <ListItemIcon>
                            <FileCopyIcon />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant='body2'>Copy URL</Typography>
                        </ListItemText>
                    </MenuItem>
                    <PermissionHOC permission={ADMIN}>
                        {({ hasAccess }) => (
                            <MenuItem
                                sx={defaultBorderRadius}
                                onClick={onOpenSignals}
                                disabled={!hasAccess}
                            >
                                <ListItemIcon>
                                    <Visibility />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant='body2'>
                                        View signals
                                    </Typography>
                                </ListItemText>
                            </MenuItem>
                        )}
                    </PermissionHOC>
                    <PermissionHOC permission={ADMIN}>
                        {({ hasAccess }) => (
                            <MenuItem
                                sx={defaultBorderRadius}
                                onClick={onEdit}
                                disabled={!hasAccess}
                            >
                                <ListItemIcon>
                                    <Edit />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant='body2'>
                                        Edit
                                    </Typography>
                                </ListItemText>
                            </MenuItem>
                        )}
                    </PermissionHOC>
                    <PermissionHOC permission={ADMIN}>
                        {({ hasAccess }) => (
                            <MenuItem
                                sx={defaultBorderRadius}
                                onClick={onDelete}
                                disabled={!hasAccess}
                            >
                                <ListItemIcon>
                                    <Delete />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant='body2'>
                                        Remove
                                    </Typography>
                                </ListItemText>
                            </MenuItem>
                        )}
                    </PermissionHOC>
                </MenuList>
            </Popover>
        </StyledBoxCell>
    );
};
