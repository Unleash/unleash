import { Popover, TextField, type Theme, styled } from '@mui/material';

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

const padding = (theme: Theme) => theme.spacing(1.5);

export const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
        paddingInline: 0,
        paddingTop: padding(theme),
        display: 'flex',
        flexDirection: 'column',

        gap: theme.spacing(1),
        maxHeight: '70vh',
    },
}));

export const StyledDropdownSearch = styled(TextField, {
    shouldForwardProp: (prop) => prop !== 'hideLabel',
})<{ hideLabel?: boolean }>(({ theme, hideLabel }) => ({
    paddingInline: padding(theme),
    '& .MuiInputBase-root': {
        paddingInline: padding(theme),
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
