import { Popover, styled } from '@mui/material';
import Input from 'component/common/Input/Input';

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
        width: theme.spacing(40),
        maxWidth: '90vw',
    },
}));

// The label renders outside the TextField that `styled(Input)` targets, so the
// inset lives here instead of on the field to keep the two left-aligned.
export const StyledDropdownSearchContainer = styled('div')(({ theme }) => ({
    paddingInline: theme.spacing(dropdownPadding),
}));

export const StyledDropdownSearch = styled(Input, {
    shouldForwardProp: (prop) => prop !== 'hideLabel',
})<{ hideLabel?: boolean }>(({ theme, hideLabel }) => ({
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

              // MUI's label-less legend holds the outline's top edge with a
              // `notranslate` spacer span; only collapse the notch when the
              // legend carries an actual floating label.
              'fieldset > legend > span:not(.notranslate)':
                  visuallyHiddenStyles,
          }
        : {}),
}));
