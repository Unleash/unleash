import { styled } from '@mui/system';
import { FormControlLabel, TextField } from '@mui/material';

export const StyledForm = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: '1rem',
});

export const StyledFormSection = styled('section')({
    marginBottom: '36px',
});

export const StyledHelpText = styled('p')({
    marginBottom: '0.5rem',
});

export const StyledContainer = styled('div')({
    maxWidth: '600px',
});

export const StyledButtonContainer = styled('div')({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
});

export const StyledButtonSection = styled('section')(({ theme }) => ({
    paddingTop: theme.spacing(2),
    '& > *': {
        marginRight: theme.spacing(1),
    },
}));

export const StyledTextField = styled(TextField)({
    width: '100%',
    marginBottom: '1rem',
    marginTop: '0px',
});

export const StyledSelectAllFormControlLabel = styled(FormControlLabel)({
    paddingBottom: '16px',
});

export const StyledTitle = styled('h4')({
    marginBottom: '8px',
});

export const StyledAddonParameterContainer = styled('div')({
    marginTop: '25px',
});
