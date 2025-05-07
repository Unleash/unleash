import type React from 'react';
import { useState } from 'react';
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

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    height: theme.spacing(3.5),
    width: theme.spacing(3.5),
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(1, 1.5),
}));

interface IDependencyActionsProps {
    capabilityId: string;
    feature: string;
    onEdit: () => void;
    onDelete: () => void;
}

export const ExtraActions = ({
    capabilityId,
    feature,
    onEdit,
    onDelete,
}: IDependencyActionsProps) => {
    const id = `${capabilityId}-${feature}-actions`;
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
                <StyledIconButton
                    id={id}
                    aria-controls={open ? menuId : undefined}
                    aria-haspopup='true'
                    aria-expanded={open ? 'true' : undefined}
                    onClick={openActions}
                    type='button'
                >
                    <MoreVert />
                </StyledIconButton>
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
