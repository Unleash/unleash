import { ListItem, Popover, TextField, styled } from '@mui/material';

export const StyledDropdown = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

export const StyledListItem = styled(ListItem)(({ theme }) => ({
    paddingLeft: theme.spacing(1),
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
    },
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root': {
        padding: theme.spacing(0, 1.5),
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
    },
    '& .MuiInputBase-input': {
        padding: theme.spacing(0.75, 0),
        fontSize: theme.typography.body2.fontSize,
    },
}));
