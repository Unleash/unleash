import { makeStyles } from 'tss-react/mui';
import { styled } from '@mui/system';
import Input from 'component/common/Input/Input';
import { Button, FormControlLabel, Radio, Typography } from '@mui/material';

export const Container = styled('div')({
    maxWidth: '400px',
});
export const Form = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

export const StyledInput = styled(Input)({
    width: '100%',
    marginBottom: '1rem',
});

export const ButtonContainer = styled('div')({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
});

export const CancelButton = styled(Button)({
    marginLeft: '1.5rem',
});

export const InputDescription = styled('p')({
    marginBottom: '0.5rem',
});

export const RoleSubTitle = styled(Typography)({
    margin: '0.5rem 0',
});

export const RoleBox = styled(FormControlLabel)({
    margin: '3px 0',
    border: '1px solid #EFEFEF',
    padding: '1rem',
});

export const FlexRow = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

export const RoleRadio = styled(Radio)({
    marginRight: '15px',
});
