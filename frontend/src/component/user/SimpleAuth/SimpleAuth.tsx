import {
    type ChangeEventHandler,
    type FormEventHandler,
    useState,
    type VFC,
} from 'react';
import { Button, TextField } from '@mui/material';
import styles from './SimpleAuth.module.scss';
import { useNavigate } from 'react-router-dom';
import { useAuthApi } from 'hooks/api/actions/useAuthApi/useAuthApi';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { LOGIN_BUTTON, LOGIN_EMAIL_ID } from 'utils/testIds';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { IAuthEndpointDetailsResponse } from 'hooks/api/getters/useAuth/useAuthEndpoint';

interface ISimpleAuthProps {
    authDetails: IAuthEndpointDetailsResponse;
    redirect: string;
}

const SimpleAuth: VFC<ISimpleAuthProps> = ({ authDetails, redirect }) => {
    const [email, setEmail] = useState('');
    const [isPending, setIsPending] = useState(false);
    const { refetchUser } = useAuthUser();
    const { emailAuth } = useAuthApi();
    const navigate = useNavigate();
    const { setToastApiError } = useToast();

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (evt) => {
        setIsPending(true);
        evt.preventDefault();

        try {
            await emailAuth(authDetails.path, email);
            await refetchUser();
            navigate(redirect);
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
        setIsPending(false);
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        const value = e.target.value;
        setEmail(value);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.container}>
                <p>{authDetails.message}</p>
                <p>
                    This instance of Unleash is not set up with a secure
                    authentication provider. You can read more about{' '}
                    <a
                        href='https://github.com/Unleash/unleash/blob/master/docs/securing-unleash.md'
                        target='_blank'
                        rel='noreferrer'
                    >
                        securing Unleash on GitHub
                    </a>
                </p>
                <TextField
                    value={email}
                    onChange={handleChange}
                    inputProps={{ 'data-testid': 'email-input-field' }}
                    size='small'
                    variant='outlined'
                    label='Email'
                    name='email'
                    id='email'
                    required
                    type='email'
                    data-testid={LOGIN_EMAIL_ID}
                    autoFocus
                />
                <br />

                <div>
                    <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        className={styles.button}
                        data-testid={LOGIN_BUTTON}
                        disabled={isPending}
                    >
                        Sign in
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default SimpleAuth;
