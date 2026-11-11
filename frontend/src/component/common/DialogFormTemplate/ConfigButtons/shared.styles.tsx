import { Popover, styled } from '@mui/material';
import Input from 'component/common/Input/Input';

const dropdownPadding = 1.5;

export const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
        paddingInline: 0,
        paddingTop: theme.spacing(dropdownPadding),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        maxHeight: '70vh',
        width: theme.spacing(40),
        maxWidth: '90vw',
    },
}));

// The label renders outside the TextField that `styled(Input)` targets, so the
// inset lives here instead of on the field to keep the two left-aligned.
export const StyledDropdownSearchContainer = styled('div')(({ theme }) => ({
    paddingInline: theme.spacing(dropdownPadding),
}));

export const StyledDropdownSearch = styled(Input)(({ theme }) => ({
    '& .MuiInputBase-root': {
        paddingInline: theme.spacing(1.5),
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
    },
    '& .MuiInputBase-input': {
        padding: theme.spacing(0.75, 0),
        fontSize: theme.typography.body2.fontSize,
    },
}));
