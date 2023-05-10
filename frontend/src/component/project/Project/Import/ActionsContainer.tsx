import { Box, styled } from '@mui/material';

export const ActionsContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: 'auto',
    paddingTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'flex-end',
}));
