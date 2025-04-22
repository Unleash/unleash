import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    IconButton,
    ListItemText,
    MenuItem,
    MenuList,
    Popover,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import { useState } from 'react';

const StyledActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: theme.spacing(-1),
    marginLeft: theme.spacing(-0.5),
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(1, 1.5),
}));

interface IUsersActionsCellProps {
    onEdit: () => void;
    onViewAccess?: () => void;
    onChangePassword: () => void;
    onResetPassword: () => void;
    onDelete: () => void;
    isScimUser?: boolean;
    userId: number;
}

export const UsersActionsCell = ({
    onEdit,
    onViewAccess,
    onChangePassword,
    onResetPassword,
    onDelete,
    isScimUser,
    userId,
}: IUsersActionsCellProps) => {
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const id = `user-${userId}-actions`;
    const menuId = `${id}-menu`;

    return (
        <StyledActions>
            <Tooltip title='User actions' arrow describeChild>
                <IconButton
                    id={id}
                    aria-controls={open ? 'actions-menu' : undefined}
                    aria-haspopup='true'
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    type='button'
                    size='small'
                >
                    <MoreVertIcon />
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
                    <UserAction onClick={onEdit} isScimUser={isScimUser}>
                        Edit user
                    </UserAction>
                    {onViewAccess && (
                        <UserAction onClick={onViewAccess}>
                            Access overview
                        </UserAction>
                    )}
                    <UserAction
                        onClick={() => {
                            onChangePassword();
                            handleClose();
                        }}
                        isScimUser={isScimUser}
                    >
                        Change password
                    </UserAction>
                    <UserAction
                        onClick={() => {
                            onResetPassword();
                            handleClose();
                        }}
                        isScimUser={isScimUser}
                    >
                        Reset password
                    </UserAction>
                    <UserAction
                        onClick={() => {
                            onDelete();
                            handleClose();
                        }}
                    >
                        Remove user
                    </UserAction>
                </MenuList>
            </StyledPopover>
        </StyledActions>
    );
};

interface IUserActionProps {
    onClick: () => void;
    isScimUser?: boolean;
    children: React.ReactNode;
}

const UserAction = ({ onClick, isScimUser, children }: IUserActionProps) => {
    const scimTooltip =
        'This user is managed by your SCIM provider and cannot be changed manually';

    return (
        <Tooltip title={isScimUser ? scimTooltip : ''} arrow placement='left'>
            <div>
                <MenuItem onClick={onClick} disabled={isScimUser}>
                    <ListItemText>
                        <Typography variant='body2'>{children}</Typography>
                    </ListItemText>
                </MenuItem>
            </div>
        </Tooltip>
    );
};
