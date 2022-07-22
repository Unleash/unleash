import { styled } from '@mui/material';

export const StyledIconWrapper = styled('div')<{
    marginRight?: string;
    marginTop?: string;
}>(({ theme, marginRight, marginTop }) => ({
    backgroundColor: theme.palette.grey[200],
    width: 28,
    height: 47,
    display: 'inline-flex',
    justifyContent: 'center',
    padding: '10px 0',
    color: theme.palette.primary.main,
    marginRight: marginRight ? marginRight : '0.75rem',
    marginTop: marginTop ? marginTop : 0,
}));
