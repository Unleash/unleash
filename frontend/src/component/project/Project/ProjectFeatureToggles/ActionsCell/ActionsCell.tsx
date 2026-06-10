import { useId, useState, type FC, type MouseEvent } from 'react';
import {
    Box,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
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
import {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import { useCheckProjectPermissions } from 'hooks/useHasAccess';
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

export const ActionsCell: FC<IActionsCellProps> = ({
    projectId,
    row,
    onOpenArchiveDialog,
    onOpenStaleDialog,
}) => {
    const checkAccess = useCheckProjectPermissions(projectId);
    const canClone = checkAccess(CREATE_FEATURE);
    const canArchive = checkAccess(DELETE_FEATURE);
    const canToggleStale = checkAccess(UPDATE_FEATURE);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isFeatureNameCopied, setIsFeatureNameCopied] = useState(false);
    const { setToastData } = useToast();
    const {
        original: { name: featureId, stale },
    } = row;

    const open = Boolean(anchorEl);
    const buttonId = useId();
    const menuId = useId();

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

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
                    aria-label='Feature flag actions'
                    id={buttonId}
                    data-loading
                    aria-controls={open ? menuId : undefined}
                    aria-haspopup='true'
                    aria-expanded={open}
                    onClick={handleClick}
                    type='button'
                >
                    <MoreVertIcon />
                </IconButton>
            </Tooltip>
            <Menu
                id={menuId}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                slotProps={{
                    list: {
                        'aria-labelledby': buttonId,
                    },
                }}
            >
                <MenuItem onClick={handleCopyToClipboard}>
                    <ListItemIcon>
                        {isFeatureNameCopied ? <CheckIcon /> : <FileCopyIcon />}
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant='body2'>
                            {isFeatureNameCopied ? 'Copied!' : 'Copy Name'}
                        </Typography>
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    disabled={!canClone}
                    component={RouterLink}
                    nativeButton={false}
                    to={`/projects/${projectId}/features/${featureId}/copy`}
                >
                    <ListItemIcon>
                        <LibraryAddIcon />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant='body2'>Clone</Typography>
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        onOpenArchiveDialog(featureId);
                        handleClose();
                    }}
                    disabled={!canArchive}
                >
                    <ListItemIcon>
                        <ArchiveIcon />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant='body2'>Archive</Typography>
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleClose();
                        onOpenStaleDialog({
                            featureId,
                            stale: stale === true,
                        });
                    }}
                    disabled={!canToggleStale}
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
            </Menu>
        </StyledBoxCell>
    );
};
