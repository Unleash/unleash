import { Box, Button, styled } from '@mui/material';

export const StyledContainer = styled('div')(() => ({
    maxWidth: '400px',
}));

export const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

export const CancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

export const StyledBox = styled(Box)({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
});
