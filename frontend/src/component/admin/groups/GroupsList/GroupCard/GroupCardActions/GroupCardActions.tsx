import { FC, useState } from 'react';
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Popover,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import { Delete, Edit, GroupRounded, MoreVert } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const StyledActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(1, 1.5),
}));

interface IGroupCardActions {
    groupId: number;
    onEditUsers: () => void;
    onRemove: () => void;
}

export const GroupCardActions: FC<IGroupCardActions> = ({
    groupId,
    onEditUsers,
    onRemove,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const id = `feature-${groupId}-actions`;
    const menuId = `${id}-menu`;

    return (
        <StyledActions
            onClick={e => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <Tooltip title="Group actions" arrow describeChild>
                <IconButton
                    id={id}
                    aria-controls={open ? menuId : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    type="button"
                >
                    <MoreVert />
                </IconButton>
            </Tooltip>
            <StyledPopover
                id={menuId}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                disableScrollLock={true}
            >
                <MenuList aria-labelledby={id}>
                    <MenuItem
                        onClick={handleClose}
                        component={Link}
                        to={`/admin/groups/${groupId}/edit`}
                    >
                        <ListItemIcon>
                            <Edit />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="body2">Edit group</Typography>
                        </ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            onEditUsers();
                            handleClose();
                        }}
                    >
                        <ListItemIcon>
                            <GroupRounded />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="body2">
                                Edit group users
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            onRemove();
                            handleClose();
                        }}
                    >
                        <ListItemIcon>
                            <Delete />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="body2">
                                Delete group
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                </MenuList>
            </StyledPopover>
        </StyledActions>
    );
};
