import { styled } from '@mui/material';
import passwordSuccess from 'assets/img/passwordSuccess.png';

export const AuthSuccessIcon = styled('img')({
    width: 56,
    height: 56,
});

AuthSuccessIcon.defaultProps = {
    src: passwordSuccess,
    alt: '',
};
