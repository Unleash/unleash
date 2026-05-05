import {
    type ChangeEventHandler,
    type FormEventHandler,
    useState,
    type VFC,
} from 'react';
import { Button, styled, TextField } from '@mui/material';
import styles from './DemoAuth.module.scss';
import Logo from 'assets/img/logo.svg?react';
import { LOGIN_BUTTON, LOGIN_EMAIL_ID } from 'utils/testIds';
import { useNavigate } from 'react-router-dom';
import { useAuthApi } from 'hooks/api/actions/useAuthApi/useAuthApi';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { IAuthEndpointDetailsResponse } from 'hooks/api/getters/useAuth/useAuthEndpoint';

const StyledForm = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
});

interface IDemoAuthProps {
    authDetails: IAuthEndpointDetailsResponse;
    redirect: string;
}

const DemoAuth: VFC<IDemoAuthProps> = ({ authDetails, redirect }) => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const { refetchUser } = useAuthUser();
    const { emailAuth } = useAuthApi();
    const { setToastApiError } = useToast();

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (evt) => {
        evt.preventDefault();

        try {
            await emailAuth(authDetails.path, email);
            refetchUser();
            navigate(redirect, { replace: true });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        const value = e.target.value;
        setEmail(value);
    };

    return (
        <StyledForm onSubmit={handleSubmit}>
            <Logo className={styles.logo} aria-label='Unleash logo' />
            <div className={styles.container}>
                <h2>Access the Unleash demo instance</h2>
                <p>
                    Use your email to test out the demo
                    <br />
                    No further data or credit card required
                </p>
                <div className={styles.form}>
                    <TextField
                        value={email}
                        className={styles.emailField}
                        onChange={handleChange}
                        size='small'
                        variant='outlined'
                        label='Email'
                        name='email'
                        id='email'
                        data-testid={LOGIN_EMAIL_ID}
                        required
                        type={email === 'admin' ? 'text' : 'email'}
                        slotProps={{
                            htmlInput: { 'data-testid': 'email-input-field' },
                        }}
                    />

                    <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        className={styles.button}
                        data-testid={LOGIN_BUTTON}
                    >
                        Test Unleash demo
                    </Button>
                </div>
                <p className={styles.terms}>
                    By accessing our demo instance, you agree to the
                    Unleash&nbsp;
                    <a
                        href='https://www.unleash-hosted.com/tos/'
                        target='_blank'
                        rel='noreferrer'
                    >
                        Customer Terms of Service
                    </a>{' '}
                    and&nbsp;
                    <a
                        href='https://www.unleash-hosted.com/privacy-policy/'
                        target='_blank'
                        rel='noreferrer'
                    >
                        Privacy Policy
                    </a>
                </p>
            </div>
        </StyledForm>
    );
};

export default DemoAuth;
