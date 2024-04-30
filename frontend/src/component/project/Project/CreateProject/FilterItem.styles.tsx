import { Checkbox, ListItem, Popover, TextField, styled } from '@mui/material';

export const StyledDropdown = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    maxHeight: '70vh',
}));

export const StyledListItem = styled(ListItem)(({ theme }) => ({
    paddingLeft: theme.spacing(1),
    cursor: 'pointer',
    '&:hover, &:focus': {
        backgroundColor: theme.palette.action.hover,
        outline: 'none',
    },
}));

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    padding: theme.spacing(1, 1, 1, 1.5),
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
