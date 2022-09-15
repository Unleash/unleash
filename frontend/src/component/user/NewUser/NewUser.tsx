import { Box, TextField, Typography } from '@mui/material';
import useResetPassword from 'hooks/api/getters/useResetPassword/useResetPassword';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AuthOptions from '../common/AuthOptions/AuthOptions';
import DividerText from 'component/common/DividerText/DividerText';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useInviteTokens } from 'hooks/api/getters/useInviteTokens/useInviteTokens';
import ResetPasswordForm from '../common/ResetPasswordForm/ResetPasswordForm';
import InvalidToken from '../common/InvalidToken/InvalidToken';
import { NewUserWrapper } from './NewUserWrapper/NewUserWrapper';

export const NewUser = () => {
    const { authDetails } = useAuthDetails();
    const {
        token,
        data,
        loading: resetLoading,
        setLoading,
        invalidToken,
    } = useResetPassword();
    const { invite, loading: inviteLoading } = useInviteTokens();
    const passwordDisabled = authDetails?.defaultHidden === true;

    if (invalidToken && !invite) {
        return (
            <NewUserWrapper loading={resetLoading || inviteLoading}>
                <InvalidToken />
            </NewUserWrapper>
        );
    }

    return (
        <NewUserWrapper
            loading={resetLoading || inviteLoading}
            title={
                passwordDisabled
                    ? 'Connect your account and start your journey'
                    : 'Enter your personal details and start your journey'
            }
        >
            <ConditionallyRender
                condition={data?.createdBy}
                show={
                    <Typography
                        variant="body1"
                        data-loading
                        sx={{ textAlign: 'center', mb: 2 }}
                    >
                        {data?.createdBy}
                        <br /> has invited you to join Unleash.
                    </Typography>
                }
            />
            <Typography color="text.secondary">
                We suggest using{' '}
                <Typography component="strong" fontWeight="bold">
                    the email you use for work
                </Typography>
                .
            </Typography>
            <ConditionallyRender
                condition={Boolean(authDetails?.options?.length)}
                show={
                    <Box sx={{ mt: 2 }}>
                        <AuthOptions options={authDetails?.options} />
                    </Box>
                }
            />
            <ConditionallyRender
                condition={
                    Boolean(authDetails?.options?.length) && !passwordDisabled
                }
                show={
                    <DividerText
                        text="or sign-up with an email address"
                        data-loading
                    />
                }
            />
            <ConditionallyRender
                condition={!passwordDisabled}
                show={
                    <>
                        <ConditionallyRender
                            condition={data?.email}
                            show={() => (
                                <Typography
                                    data-loading
                                    variant="body1"
                                    sx={{ my: 1 }}
                                >
                                    Your username is
                                </Typography>
                            )}
                        />
                        <TextField
                            data-loading
                            type="email"
                            value={data?.email || ''}
                            id="username"
                            label="Email"
                            variant="outlined"
                            size="small"
                            sx={{ my: 1 }}
                            disabled={Boolean(data?.email)}
                            fullWidth
                            required
                        />
                        <ConditionallyRender
                            condition={Boolean(invite)}
                            show={() => (
                                <TextField
                                    data-loading
                                    value=""
                                    id="username"
                                    label="Full name"
                                    variant="outlined"
                                    size="small"
                                    sx={{ my: 1 }}
                                    fullWidth
                                    required
                                />
                            )}
                        />
                        <Typography variant="body1" data-loading sx={{ mt: 2 }}>
                            Set a password for your account.
                        </Typography>
                        <ResetPasswordForm
                            token={token}
                            setLoading={setLoading}
                        />
                    </>
                }
            />
        </NewUserWrapper>
    );
};
