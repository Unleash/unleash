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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import { useCheckProjectPermissions } from 'hooks/useHasAccess';

const StyledBoxCell = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    paddingRight: theme.spacing(2),
}));

interface IArchivedActionsCellProps {
    projectId: string;
    onRevive: () => void;
    onDelete: () => void;
}

export const ArchivedActionsCell: FC<IArchivedActionsCellProps> = ({
    projectId,
    onRevive,
    onDelete,
}) => {
    const checkAccess = useCheckProjectPermissions(projectId);
    const canRevive = checkAccess(UPDATE_FEATURE);
    const canDelete = checkAccess(DELETE_FEATURE);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const buttonId = useId();
    const menuId = useId();

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
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
                <MenuItem
                    disabled={!canRevive}
                    onClick={() => {
                        onRevive();
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <UndoIcon />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant='body2'>
                            Revive feature flag
                        </Typography>
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    disabled={!canDelete}
                    onClick={() => {
                        onDelete();
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <DeleteIcon />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant='body2'>
                            Delete feature flag
                        </Typography>
                    </ListItemText>
                </MenuItem>
            </Menu>
        </StyledBoxCell>
    );
};
