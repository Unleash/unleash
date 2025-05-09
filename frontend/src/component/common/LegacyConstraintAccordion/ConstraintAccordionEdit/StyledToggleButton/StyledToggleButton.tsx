import { styled } from '@mui/system';
import { IconButton } from '@mui/material';

/**
 * @deprecated use NewConstraintAccordion components
 */
export const StyledToggleButtonOff = styled(IconButton)(({ theme }) => ({
    width: '28px',
    minWidth: '28px',
    maxWidth: '28px',
    height: 'auto',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: '0 1px 0',
    marginRight: '1rem',
    '&:hover': {
        background: theme.palette.background.application,
    },
    [theme.breakpoints.between(1101, 1365)]: {
        marginRight: '0.5rem',
        alignItems: 'center',
    },
}));

/**
 * @deprecated use NewConstraintAccordion components
 */
export const StyledToggleButtonOn = styled(IconButton)(({ theme }) => ({
    width: '28px',
    minWidth: '28px',
    maxWidth: '28px',
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
    marginRight: '1rem',
    padding: '0 1px 0',
    '&:hover': {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
    },
    [theme.breakpoints.between(1101, 1365)]: {
        marginRight: '0.5rem',
        alignItems: 'center',
    },
}));
