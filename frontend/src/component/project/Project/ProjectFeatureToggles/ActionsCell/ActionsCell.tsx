import { useState, type VFC } from 'react';
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
import { Link as RouterLink } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import CheckIcon from '@mui/icons-material/Check';
import ArchiveIcon from '@mui/icons-material/Archive';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import { defaultBorderRadius } from 'themes/themeStyles';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';

const StyledBoxCell = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    paddingRight: theme.spacing(2),
}));

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
    const [isFeatureNameCopied, setIsFeatureNameCopied] = useState(false);
    const { setToastData } = useToast();
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

    const handleCopyToClipboard = () => {
        try {
            copy(featureId);
            setIsFeatureNameCopied(true);

            setTimeout(() => {
                handleClose();
                setIsFeatureNameCopied(false);
            }, 1000);
        } catch (_error: unknown) {
            setToastData({
                type: 'error',
                text: 'Could not copy feature name',
            });
        }
    };

    return (
        <StyledBoxCell>
            <Tooltip title='Feature flag actions' arrow describeChild>
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
                        onClick={handleCopyToClipboard}
                    >
                        <ListItemIcon>
                            {isFeatureNameCopied ? (
                                <CheckIcon />
                            ) : (
                                <FileCopyIcon />
                            )}
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant='body2'>
                                {isFeatureNameCopied ? 'Copied!' : 'Copy Name'}
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                    <PermissionHOC
                        projectId={projectId}
                        permission={CREATE_FEATURE}
                    >
                        {({ hasAccess }) => (
                            <MenuItem
                                sx={defaultBorderRadius}
                                onClick={handleClose}
                                disabled={!hasAccess}
                                component={RouterLink}
                                to={`/projects/${projectId}/features/${featureId}/copy`}
                            >
                                <ListItemIcon>
                                    <LibraryAddIcon />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant='body2'>
                                        Clone
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
                                sx={defaultBorderRadius}
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
                                    <Typography variant='body2'>
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
                                sx={defaultBorderRadius}
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
                                    <Typography variant='body2'>
                                        {stale ? 'Un-mark' : 'Mark'} as stale
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
