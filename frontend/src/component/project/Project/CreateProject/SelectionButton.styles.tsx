import { Checkbox, ListItem, Popover, TextField, styled } from '@mui/material';

export const StyledDropdown = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
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
    minHeight: theme.spacing(4.5),
}));

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    padding: theme.spacing(1, 1, 1, 1.5),
}));

export const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
    },
}));

const visuallyHiddenStyles = {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 'auto',
    margin: 0,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px',
    whiteSpace: 'nowrap',
};

export const HiddenDescription = styled('p')(() => ({
    ...visuallyHiddenStyles,
    position: 'absolute',
}));

export const StyledDropdownSearch = styled(TextField, {
    shouldForwardProp: (prop) => prop !== 'hideLabel',
})<{ hideLabel?: boolean }>(({ theme, hideLabel }) => ({
    '& .MuiInputBase-root': {
        padding: theme.spacing(0, 1.5),
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
    },
    '& .MuiInputBase-input': {
        padding: theme.spacing(0.75, 0),
        fontSize: theme.typography.body2.fontSize,
    },

    ...(hideLabel
        ? {
              label: visuallyHiddenStyles,

              'fieldset > legend > span': visuallyHiddenStyles,
          }
        : {}),
}));

export const TableSearchInput = styled(StyledDropdownSearch)(({ theme }) => ({
    maxWidth: '30ch',
}));
