import { styled } from '@mui/material';

export const StyledIconWrapper = styled('div')<{
    marginright?: string;
}>(({ theme, marginright }) => ({
    backgroundColor: theme.palette.grey[200],
    width: 28,
    height: 48,
    display: 'inline-flex',
    justifyContent: 'center',
    padding: '10px 0',
    color: theme.palette.primary.main,
    marginRight: marginright ? marginright : '1rem',
    marginTop: 'auto',
    marginBottom: 'auto',
}));
