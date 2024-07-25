import { Checkbox, ListItem, styled } from '@mui/material';

export const StyledListItem = styled(ListItem)(({ theme }) => ({
    paddingLeft: theme.spacing(1),
    cursor: 'pointer',
    '&:hover, &:focus': {
        backgroundColor: theme.palette.action.hover,
        outline: 'none',
    },
    minHeight: theme.spacing(4.5),
}));

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    padding: theme.spacing(1, 1, 1, 1.5),
}));
