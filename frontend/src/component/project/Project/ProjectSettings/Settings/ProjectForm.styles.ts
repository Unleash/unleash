import Input from 'component/common/Input/Input';
import { TextField, Button, styled } from '@mui/material';

export const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

export const StyledContainer = styled('div')(() => ({
    maxWidth: '400px',
}));

export const StyledDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
}));

export const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

export const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

export const StyledButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));
