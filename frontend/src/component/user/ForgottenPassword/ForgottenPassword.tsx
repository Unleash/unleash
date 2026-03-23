import {
    Alert,
    AlertTitle,
    Button,
    Divider,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { type SyntheticEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import useLoading from 'hooks/useLoading';
import { FORGOTTEN_PASSWORD_FIELD } from 'utils/testIds';
import { formatApiPath } from 'utils/formatPath';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useFlag } from '@unleash/proxy-client-react';
import DeprecatedForgottenPassword from './DeprecatedForgottenPassword';
import { AuthPageLayout } from '../common/AuthPageLayout';
import passwordSuccess from 'assets/img/passwordSuccess.png';

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '28px',
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    lineHeight: '20px',
    marginTop: theme.spacing(0.5),
}));

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    textAlign: 'center',
    marginBottom: theme.spacing(3),
}));

const StyledInfoBox = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.info.light,
    border: `1px solid ${theme.palette.info.border}`,
}));

const StyledInfoContent = styled('div')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    lineHeight: '20px',
    color: theme.palette.info.dark,
}));

type State = 'initial' | 'loading' | 'attempted' | 'too_many_attempts';

const NewForgottenPassword = () => {
    const [email, setEmail] = useState('');
    const [state, setState] = useState<State>('initial');
    const [attemptedEmail, setAttemptedEmail] = useState('');
    const ref = useLoading(state === 'loading');

    const onSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        setState('loading');
        setAttemptedEmail(email);

        const path = formatApiPath('auth/reset/password-email');
        const res = await fetch(path, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        if (res.status === 429) {
            setState('too_many_attempts');
        } else {
            setState('attempted');
        }
    };

    const attempted = state === 'attempted';

    return (
        <AuthPageLayout>
            <div ref={ref}>
                <ConditionallyRender
                    condition={attempted}
                    show={
                        <StyledHeader>
                            <img
                                src={passwordSuccess}
                                alt=''
                                width={56}
                                height={56}
                            />
                            <div>
                                <StyledTitle variant='h2'>
                                    Email sent to
                                </StyledTitle>
                                <StyledSubtitle variant='body2'>
                                    {attemptedEmail}
                                </StyledSubtitle>
                            </div>
                        </StyledHeader>
                    }
                    elseShow={
                        <StyledTitle sx={{ mb: 3 }}>
                            Forgot your password?
                        </StyledTitle>
                    }
                />
                <ConditionallyRender
                    condition={state === 'too_many_attempts'}
                    show={
                        <Alert severity='warning' sx={{ mb: 3 }}>
                            <AlertTitle>
                                Too many password reset attempts
                            </AlertTitle>
                            Please wait another minute before your next attempt
                        </Alert>
                    }
                />
                <StyledForm onSubmit={onSubmit}>
                    <ConditionallyRender
                        condition={attempted}
                        show={
                            <StyledInfoBox>
                                <InfoOutlinedIcon
                                    sx={{
                                        fontSize: 24,
                                        color: 'info.main',
                                    }}
                                />
                                <StyledInfoContent>
                                    <strong>
                                        Didn't receive an email?
                                    </strong>
                                    <br />
                                    Please verify that you typed in the correct
                                    email, or contact your administrator
                                </StyledInfoContent>
                            </StyledInfoBox>
                        }
                        elseShow={
                            <Typography variant='body2'>
                                Enter your email address. If it exists in the
                                system, we'll send you a reset password link.
                            </Typography>
                        }
                    />
                    <TextField
                        label='Email'
                        variant='outlined'
                        size='small'
                        type='email'
                        data-testid={FORGOTTEN_PASSWORD_FIELD}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                        autoFocus
                    />
                    <Button
                        variant='contained'
                        type='submit'
                        color='primary'
                        disabled={state === 'loading'}
                        fullWidth
                    >
                        {attempted ? 'Try again' : 'Reset password'}
                    </Button>
                    <Divider>OR</Divider>
                    <Button
                        variant='outlined'
                        component={Link}
                        to='/login'
                        fullWidth
                    >
                        Go back to sign in
                    </Button>
                </StyledForm>
            </div>
        </AuthPageLayout>
    );
};

const ForgottenPassword = () => {
    const newLogin = useFlag('newLogin');
    if (newLogin) {
        return <NewForgottenPassword />;
    }
    return <DeprecatedForgottenPassword />;
};

export default ForgottenPassword;
