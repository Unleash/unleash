import { Box, Button, styled } from '@mui/material';
import Input from '../../../common/Input/Input';
import GeneralSelect from '../../../common/GeneralSelect/GeneralSelect';

export const StyledContainer = styled('div')(() => ({
    maxWidth: '400px',
}));

export const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

export const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

export const StyledSelectInput = styled(GeneralSelect)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    minWidth: '400px',
    [theme.breakpoints.down('sm')]: {
        minWidth: '379px',
    },
}));

export const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

export const StyledInputLabel = styled('label')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

export const CancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

export const StyledBox = styled(Box)({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
});
