import type React from 'react';
import { type FC, useState } from 'react';
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
    Box,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import MoreVert from '@mui/icons-material/MoreVert';

const StyledPopover = styled(Popover)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(1, 1.5),
}));

export const DependencyActions: FC<{
    feature: string;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ feature, onEdit, onDelete }) => {
    const id = `dependency-${feature}-actions`;
    const menuId = `${id}-menu`;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);
    const openActions = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const closeActions = () => {
        setAnchorEl(null);
    };

    return (
        <Box>
            <Tooltip title='Dependency actions' arrow describeChild>
                <IconButton
                    sx={{ mr: 0.25 }}
                    id={id}
                    aria-controls={open ? menuId : undefined}
                    aria-haspopup='true'
                    aria-expanded={open ? 'true' : undefined}
                    onClick={openActions}
                    type='button'
                >
                    <MoreVert />
                </IconButton>
            </Tooltip>
            <StyledPopover
                id={menuId}
                anchorEl={anchorEl}
                open={open}
                onClose={closeActions}
                transformOrigin={{
                    horizontal: 'right',
                    vertical: 'top',
                }}
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'bottom',
                }}
                disableScrollLock={true}
            >
                <MenuList aria-labelledby={id}>
                    <MenuItem
                        onClick={() => {
                            onEdit();
                            closeActions();
                        }}
                    >
                        <ListItemIcon>
                            <Edit />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant='body2'>Edit</Typography>
                        </ListItemText>
                    </MenuItem>

                    <MenuItem
                        onClick={() => {
                            onDelete();
                            closeActions();
                        }}
                    >
                        <ListItemIcon>
                            <Delete />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant='body2'>Delete</Typography>
                        </ListItemText>
                    </MenuItem>
                </MenuList>
            </StyledPopover>
        </Box>
    );
};
