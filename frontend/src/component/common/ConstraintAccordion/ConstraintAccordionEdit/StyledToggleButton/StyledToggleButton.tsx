import { styled } from '@mui/system';
import { IconButton } from '@mui/material';

export const StyledToggleButtonOff = styled(IconButton)(({ theme }) => ({
    width: 28,
    minWidth: '28px!important',
    minHeight: 40,
    backgroundColor: 'white',
    borderRadius: theme.shape.borderRadius,
    padding: '0 1px 0',
    marginRight: '1rem',
    '&:hover': {
        background: theme.palette.grey[300],
    },
}));

export const StyledToggleButtonOn = styled(IconButton)(({ theme }) => ({
    width: 28,
    minWidth: '28px!important',
    minHeight: 40,
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
    marginRight: '1rem',
    padding: '0 1px 0',
    '&:hover': {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
    },
}));
