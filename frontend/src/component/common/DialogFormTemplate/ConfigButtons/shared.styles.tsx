import { Popover, TextField, styled } from '@mui/material';

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
    },
}));

export const StyledDropdownSearch = styled(TextField, {
    shouldForwardProp: (prop) => prop !== 'hideLabel',
})<{ hideLabel?: boolean }>(({ theme, hideLabel }) => ({
    paddingInline: theme.spacing(dropdownPadding),
    '& .MuiInputBase-root': {
        paddingInline: theme.spacing(1.5),
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
