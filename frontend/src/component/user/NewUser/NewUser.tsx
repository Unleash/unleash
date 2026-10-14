import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import useResetPassword from 'hooks/api/getters/useResetPassword/useResetPassword';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUserInvite } from 'hooks/api/getters/useUserInvite/useUserInvite';
import AuthOptions from '../common/AuthOptions/AuthOptions.tsx';
import DividerText from 'component/common/DividerText/DividerText';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import ResetPasswordForm from '../common/ResetPasswordForm/ResetPasswordForm.tsx';
import InvalidToken from '../common/InvalidToken/InvalidToken.tsx';
import { NewUserWrapper } from './NewUserWrapper/NewUserWrapper.tsx';
import ResetPasswordError from '../common/ResetPasswordError/ResetPasswordError.tsx';
import Input from 'component/common/Input/Input.tsx';
import { useFlag } from '@unleash/proxy-client-react';
import { InviteSignup } from './InviteSignup/InviteSignup.tsx';
import { useNewUserSubmit } from './useNewUserSubmit.ts';

const LegacyNewUser = () => {
    const { authDetails } = useAuthDetails();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const {
        data: passwordResetData,
        loading: resetLoading,
        isValidToken,
    } = useResetPassword();
    const { loading: inviteLoading, isValid: isValidInvite } = useUserInvite();
    const { onSubmit, apiError, loading: isSubmitting } = useNewUserSubmit();
    const passwordDisabled = authDetails?.defaultHidden === true;
    const showAuthOptions =
        Boolean(authDetails?.options?.length) &&
        (!isValidInvite || passwordDisabled);

    if (!isValidToken && !isValidInvite) {
        return (
            <NewUserWrapper loading={resetLoading || inviteLoading}>
                <InvalidToken />
            </NewUserWrapper>
        );
    }

    return (
        <NewUserWrapper
            loading={resetLoading || inviteLoading || isSubmitting}
            title={
                passwordDisabled
                    ? 'Connect your account and start your journey'
                    : 'Enter your personal details and start your journey'
            }
        >
            <ConditionallyRender
                condition={passwordResetData?.createdBy}
                show={
                    <Typography
                        variant='body1'
                        data-loading
                        sx={{ textAlign: 'center', mb: 2 }}
                    >
                        {passwordResetData?.createdBy}
                        <br /> has invited you to join Unleash.
                    </Typography>
                }
            />
            <Typography
                sx={{
                    color: 'text.secondary',
                }}
            >
                We suggest using{' '}
                <Typography
                    component='strong'
                    sx={{
                        fontWeight: 'bold',
                    }}
                >
                    the email you use for work
                </Typography>
                .
            </Typography>
            <ConditionallyRender
                condition={showAuthOptions}
                show={
                    <Box sx={{ mt: 2 }}>
                        <AuthOptions options={authDetails?.options} />
                    </Box>
                }
            />
            <ConditionallyRender
                condition={showAuthOptions && !passwordDisabled}
                show={
                    <DividerText
                        text='or sign-up with an email address'
                        data-loading
                    />
                }
            />
            <ConditionallyRender
                condition={!passwordDisabled}
                show={
                    <>
                        <ConditionallyRender
                            condition={passwordResetData?.email}
                            show={() => (
                                <Typography
                                    data-loading
                                    variant='body1'
                                    sx={{ my: 1 }}
                                >
                                    Your username is
                                </Typography>
                            )}
                        />
                        <Input
                            data-loading
                            type='email'
                            value={
                                isValidToken
                                    ? passwordResetData?.email || ''
                                    : email
                            }
                            id='email'
                            label='Email'
                            size='large'
                            sx={{ my: 1 }}
                            disabled={isValidToken}
                            fullWidth
                            required
                            onChange={(e) => {
                                if (isValidToken) {
                                    return;
                                }
                                setEmail(e.target.value);
                            }}
                        />
                        <ConditionallyRender
                            condition={Boolean(isValidInvite)}
                            show={() => (
                                <Input
                                    data-loading
                                    value={name}
                                    id='username'
                                    label='Full name'
                                    size='large'
                                    sx={{ my: 1 }}
                                    fullWidth
                                    required
                                    onChange={(e) => {
                                        setName(e.target.value);
                                    }}
                                />
                            )}
                        />
                        <Typography variant='body1' data-loading sx={{ mt: 2 }}>
                            Set a password for your account.
                        </Typography>
                        <ConditionallyRender
                            condition={isValidToken}
                            show={
                                <ResetPasswordError>
                                    {apiError}
                                </ResetPasswordError>
                            }
                        />
                        <ResetPasswordForm
                            onSubmit={(password) =>
                                onSubmit({ name, email, password })
                            }
                        />
                    </>
                }
            />
        </NewUserWrapper>
    );
};

export const NewUser = () => {
    const newInviteFlow = useFlag('newInviteFlow');

    return newInviteFlow ? <InviteSignup /> : <LegacyNewUser />;
};
