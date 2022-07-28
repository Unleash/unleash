import { useState, VFC } from 'react';
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
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ArchiveIcon from '@mui/icons-material/Archive';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import { useStyles } from './ActionsCell.styles';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';

interface IActionsCellProps {
    projectId: string;
    row: {
        original: {
            name: string;
            stale?: boolean;
        };
    };
    onOpenArchiveDialog: (featureId: string) => void;
    onOpenStaleDialog: (props: { featureId: string; stale: boolean }) => void;
}

export const ActionsCell: VFC<IActionsCellProps> = ({
    projectId,
    row,
    onOpenArchiveDialog,
    onOpenStaleDialog,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { classes } = useStyles();
    const {
        original: { name: featureId, stale },
    } = row;

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const id = `feature-${featureId}-actions`;
    const menuId = `${id}-menu`;

    return (
        <Box className={classes.cell}>
            <Tooltip title="Feature toggle actions" arrow describeChild>
                <IconButton
                    id={id}
                    aria-controls={open ? menuId : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    type="button"
                >
                    <MoreVertIcon />
                </IconButton>
            </Tooltip>
            <Popover
                id={menuId}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                disableScrollLock={true}
                PaperProps={{
                    className: classes.menuContainer,
                }}
            >
                <MenuList aria-labelledby={id}>
                    <PermissionHOC
                        projectId={projectId}
                        permission={CREATE_FEATURE}
                    >
                        {({ hasAccess }) => (
                            <MenuItem
                                className={classes.item}
                                onClick={handleClose}
                                disabled={!hasAccess}
                                component={RouterLink}
                                to={`/projects/${projectId}/features/${featureId}/strategies/copy`}
                            >
                                <ListItemIcon>
                                    <FileCopyIcon />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant="body2">
                                        Copy
                                    </Typography>
                                </ListItemText>
                            </MenuItem>
                        )}
                    </PermissionHOC>
                    <PermissionHOC
                        projectId={projectId}
                        permission={DELETE_FEATURE}
                    >
                        {({ hasAccess }) => (
                            <MenuItem
                                className={classes.item}
                                onClick={() => {
                                    onOpenArchiveDialog(featureId);
                                    handleClose();
                                }}
                                disabled={!hasAccess}
                            >
                                <ListItemIcon>
                                    <ArchiveIcon />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant="body2">
                                        Archive
                                    </Typography>
                                </ListItemText>
                            </MenuItem>
                        )}
                    </PermissionHOC>
                    <PermissionHOC
                        projectId={projectId}
                        permission={UPDATE_FEATURE}
                    >
                        {({ hasAccess }) => (
                            <MenuItem
                                className={classes.item}
                                onClick={() => {
                                    handleClose();
                                    onOpenStaleDialog({
                                        featureId,
                                        stale: stale === true,
                                    });
                                }}
                                disabled={!hasAccess}
                            >
                                <ListItemIcon>
                                    <WatchLaterIcon />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant="body2">
                                        {stale ? 'Un-mark' : 'Mark'} as stale
                                    </Typography>
                                </ListItemText>
                            </MenuItem>
                        )}
                    </PermissionHOC>
                </MenuList>
            </Popover>
        </Box>
    );
};
