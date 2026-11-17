import { Popover, styled } from '@mui/material';
import type { ComponentProps } from 'react';
import Input from 'component/common/Input/Input';

const dropdownPadding = 1.5;

export const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
        paddingBlockStart: theme.spacing(dropdownPadding),
        paddingInline: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        maxHeight: '70vh',
        width: theme.spacing(40),
        maxWidth: '90vw',
        // remove top padding if there's no header or search input
        ':not(:has([data-dropdown-header], [data-dropdown-search]))': {
            paddingBlockStart: 0,
        },
    },
}));

// The label renders outside the TextField that `styled(Input)` targets, so the
// inset lives here instead of on the field to keep the two left-aligned.
export const StyledDropdownSearchContainer = styled('div')(({ theme }) => ({
    paddingInline: theme.spacing(dropdownPadding),
}));

const SearchInput = (props: ComponentProps<typeof Input>) => (
    <Input type='search' {...props} />
);

export const StyledDropdownSearch = styled(SearchInput)(({ theme }) => ({
    '& .MuiInputBase-root': {
        paddingInline: theme.spacing(1.5),
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
    },
    '& .MuiInputBase-input': {
        padding: theme.spacing(0.75, 0),
        fontSize: theme.typography.body2.fontSize,
    },
}));
