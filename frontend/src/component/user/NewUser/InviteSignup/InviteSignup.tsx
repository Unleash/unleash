import { type FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';
import {
    Button,
    Divider,
    Link,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import LockRounded from '@mui/icons-material/LockRounded';
import GoogleIcon from 'assets/img/inviteSignup/google.svg?react';
import GitHubIcon from 'assets/img/inviteSignup/github.svg?react';
import useLoading from 'hooks/useLoading';
import useToast from 'hooks/useToast';
import { CREATED, OK } from 'constants/statusCodes';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useInviteTokenApi } from 'hooks/api/actions/useInviteTokenApi/useInviteTokenApi';
import { useAuthResetPasswordApi } from 'hooks/api/actions/useAuthResetPasswordApi/useAuthResetPasswordApi';
import useResetPassword from 'hooks/api/getters/useResetPassword/useResetPassword';
import { useUserInvite } from 'hooks/api/getters/useUserInvite/useUserInvite';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { useAuthApi } from 'hooks/api/actions/useAuthApi/useAuthApi';
import { basePath } from 'utils/formatPath';
import type { IAuthOptions } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import { SSO_LOGIN_BUTTON } from 'utils/testIds';
import InvalidToken from '../../common/InvalidToken/InvalidToken.tsx';
import { AuthSplitLayout } from '../../common/AuthSplitLayout/AuthSplitLayout.tsx';
import { getInstanceName } from './getInstanceName.ts';
import { SetPassword } from './SetPassword.tsx';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    wordBreak: 'break-word',
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '28px',
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    lineHeight: '20px',
    color: theme.palette.text.secondary,
}));

const StyledAuthOptions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledAuthOptionButton = styled(Button)(({ theme }) => ({
    '&&&': {
        height: 40,
        gap: theme.spacing(0.5),
        color: theme.palette.text.primary,
        borderColor: theme.palette.neutral.containerBorder,
        fontWeight: theme.typography.fontWeightBold,
    },
    '&&&:hover': {
        borderColor: theme.palette.text.primary,
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledOrDivider = styled(Divider)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '16px',
    color: theme.palette.text.secondary,
    '&::before, &::after': {
        borderColor: theme.palette.neutral.containerBorder,
    },
}));

const StyledEmailForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledEmailField = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledLabel = styled('label')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '22px',
}));

const StyledEmailInput = styled(TextField)(({ theme }) => ({
    '&&& .MuiOutlinedInput-root': {
        height: 52,
        fontWeight: theme.typography.fontWeightMedium,
    },
    '& .MuiOutlinedInput-root.Mui-readOnly': {
        backgroundColor: theme.palette.background.elevation1,
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.neutral.containerBorder,
    },
}));

const StyledPrimaryButton = styled(Button)(({ theme }) => ({
    height: 40,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledFinePrint = styled(Typography)(({ theme }) => ({
    lineHeight: 1.34,
    color: theme.palette.text.secondary,
}));

const StyledFinePrintLink = styled(Link)(({ theme }) => ({
    color: theme.palette.text.primary,
    textDecorationColor: 'currentColor',
}));

const StyledSignIn = styled(Typography)({
    lineHeight: '20px',
});

const StyledSignInLink = styled(RouterLink)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.primary.dark,
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
}));

const renderAuthOptionIcon = ({ type }: IAuthOptions) => {
    if (type === 'google') {
        return <GoogleIcon aria-hidden />;
    }
    if (type === 'github') {
        return <GitHubIcon aria-hidden />;
    }
    return <LockRounded aria-hidden />;
};

export const InviteSignup = () => {
    const { authDetails } = useAuthDetails();
    const { setToastApiError } = useToast();
    const navigate = useNavigate();
    const { refetchUser } = useAuthUser();
    const { passwordAuth } = useAuthApi();
    const [apiError, setApiError] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [name, setName] = useState('');
    const {
        token,
        data: tokenData,
        loading: tokenLoading,
        isValidToken,
    } = useResetPassword();
    const {
        secret,
        loading: inviteLoading,
        isValid: isValidInvite,
    } = useUserInvite();
    const { addUser, loading: isUserSubmitting } = useInviteTokenApi();
    const { resetPassword, loading: isPasswordSubmitting } =
        useAuthResetPasswordApi();
    const ref = useLoading(tokenLoading || inviteLoading);
    const [step, setStep] = useState<'email' | 'password'>('email');

    const passwordDisabled = authDetails?.defaultHidden === true;
    const authOptions = authDetails?.options ?? [];
    const showAuthOptions =
        authOptions.length > 0 && (!isValidInvite || passwordDisabled);
    const tokenEmail = isValidToken ? tokenData?.email : undefined;
    const instanceName = getInstanceName(basePath);
    const email = tokenEmail ?? inviteEmail;

    const onContinueWithEmail = (e: FormEvent) => {
        e.preventDefault();
        setStep('password');
    };

    const logIn = async (password: string) => {
        try {
            if (!authDetails?.path) {
                throw new Error('Password login is not available');
            }
            await passwordAuth(authDetails.path, email, password);
            refetchUser();
            navigate('/', { replace: true });
        } catch {
            navigate('/login?invited=true');
        }
    };

    const onSubmitInvitedUser = async (password: string) => {
        try {
            const res = await addUser(secret, { name, email, password });
            if (res.status === CREATED) {
                await logIn(password);
            } else {
                setToastApiError(
                    "Couldn't create user. Check if your invite link is valid.",
                );
            }
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onSubmitPasswordReset = async (password: string) => {
        try {
            const res = await resetPassword({ token, password });
            if (res.status === OK) {
                navigate('/login?reset=true');
            } else {
                setApiError(
                    'Something went wrong when attempting to update your password. This could be due to unstable internet connectivity. If retrying the request does not work, please try again later.',
                );
            }
        } catch (e) {
            const error = formatUnknownError(e);
            setApiError(error);
        }
    };

    const onSubmit = (password: string) => {
        if (isValidInvite) {
            onSubmitInvitedUser(password);
        } else {
            onSubmitPasswordReset(password);
        }
    };

    if (!isValidToken && !isValidInvite) {
        return (
            <AuthSplitLayout>
                <div ref={ref}>
                    <InvalidToken />
                </div>
            </AuthSplitLayout>
        );
    }

    if (step === 'password') {
        return (
            <AuthSplitLayout>
                <SetPassword
                    email={email}
                    name={name}
                    onNameChange={setName}
                    requireName={Boolean(isValidInvite)}
                    loading={isUserSubmitting || isPasswordSubmitting}
                    apiError={isValidToken ? apiError : ''}
                    onSubmit={onSubmit}
                />
            </AuthSplitLayout>
        );
    }

    return (
        <AuthSplitLayout>
            <StyledContainer ref={ref}>
                <StyledHeader>
                    <StyledTitle variant='h1' data-loading>
                        {tokenData?.createdBy
                            ? `${tokenData.createdBy} has invited you to join ${instanceName}`
                            : `You've been invited to join ${instanceName}`}
                    </StyledTitle>
                    {tokenEmail ? (
                        <StyledSubtitle data-loading>
                            Continue with {tokenEmail} to join
                        </StyledSubtitle>
                    ) : null}
                </StyledHeader>

                {showAuthOptions ? (
                    <StyledAuthOptions>
                        {authOptions.map((option) => (
                            <StyledAuthOptionButton
                                key={option.type}
                                variant='outlined'
                                href={option.path}
                                startIcon={renderAuthOptionIcon(option)}
                                data-loading
                                data-testid={`${SSO_LOGIN_BUTTON}-${option.type}`}
                            >
                                {option.message}
                            </StyledAuthOptionButton>
                        ))}
                    </StyledAuthOptions>
                ) : null}

                {showAuthOptions && !passwordDisabled ? (
                    <StyledOrDivider>OR</StyledOrDivider>
                ) : null}

                {passwordDisabled ? null : (
                    <StyledEmailForm onSubmit={onContinueWithEmail}>
                        <StyledEmailField>
                            <StyledLabel htmlFor='invite-email'>
                                Email
                            </StyledLabel>
                            <StyledEmailInput
                                id='invite-email'
                                type='email'
                                required
                                placeholder='name@company.com'
                                autoComplete='email'
                                fullWidth
                                value={email}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                slotProps={{
                                    input: { readOnly: Boolean(tokenEmail) },
                                }}
                                data-loading
                            />
                        </StyledEmailField>
                        <StyledPrimaryButton
                            type='submit'
                            variant='contained'
                            fullWidth
                            data-loading
                        >
                            Continue with email
                        </StyledPrimaryButton>
                    </StyledEmailForm>
                )}

                <StyledFinePrint>
                    By signing up, you agree to our{' '}
                    <StyledFinePrintLink
                        href='https://www.getunleash.io/terms-of-service'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        Terms of Service
                    </StyledFinePrintLink>{' '}
                    and{' '}
                    <StyledFinePrintLink
                        href='https://www.getunleash.io/privacy-policy'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        Privacy Policy
                    </StyledFinePrintLink>
                </StyledFinePrint>

                <StyledSignIn>
                    Already have an account?{' '}
                    <StyledSignInLink to='/login'>Sign in</StyledSignInLink>
                </StyledSignIn>
            </StyledContainer>
        </AuthSplitLayout>
    );
};
