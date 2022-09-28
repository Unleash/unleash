import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Typography } from '@mui/material';
import { OK } from 'constants/statusCodes';
import useResetPassword from 'hooks/api/getters/useResetPassword/useResetPassword';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUserInvite from 'hooks/api/getters/useUserInvite/useUserInvite';
import AuthOptions from '../common/AuthOptions/AuthOptions';
import DividerText from 'component/common/DividerText/DividerText';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import ResetPasswordForm from '../common/ResetPasswordForm/ResetPasswordForm';
import InvalidToken from '../common/InvalidToken/InvalidToken';
import { NewUserWrapper } from './NewUserWrapper/NewUserWrapper';
import ResetPasswordError from '../common/ResetPasswordError/ResetPasswordError';

export const NewUser = () => {
    const { authDetails } = useAuthDetails();
    const [apiError, setApiError] = useState(false);
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const {
        data: passwordResetData,
        loading: resetLoading,
        setLoading,
        isValidToken,
        resetPassword,
    } = useResetPassword();
    const passwordDisabled = authDetails?.defaultHidden === true;
    const {
        loading: inviteLoading,
        isValid: isValidInvite,
        email,
        name,
        setEmail,
        setName,
        addUser,
    } = useUserInvite();

    const onSubmit = async (password: string) => {
        setSubmitting(true);

        try {
            const res = await (isValidInvite
                ? addUser(password)
                : resetPassword(password));
            setSubmitting(false);
            if (res.status === OK) {
                navigate('/login?reset=true');
                setApiError(false);
            } else {
                setApiError(true);
            }
        } catch (e) {
            setApiError(true);
            setSubmitting(false);
        }
    };

    if (isValidToken === false && isValidInvite == false) {
        return (
            <NewUserWrapper loading={resetLoading || inviteLoading}>
                <InvalidToken />
            </NewUserWrapper>
        );
    }

    return (
        <NewUserWrapper
            loading={submitting || resetLoading || inviteLoading}
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
                        variant="body1"
                        data-loading
                        sx={{ textAlign: 'center', mb: 2 }}
                    >
                        {passwordResetData?.createdBy}
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
                            condition={passwordResetData?.email}
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
                            value={
                                isValidToken ? passwordResetData?.email : email
                            }
                            id="email"
                            label="Email"
                            variant="outlined"
                            size="small"
                            sx={{ my: 1 }}
                            disabled={isValidToken}
                            fullWidth
                            required
                            onChange={e => {
                                if (isValidToken) {
                                    return;
                                }
                                setEmail(e.target.value);
                            }}
                        />
                        <ConditionallyRender
                            condition={Boolean(isValidInvite)}
                            show={() => (
                                <TextField
                                    data-loading
                                    value={name}
                                    id="username"
                                    label="Full name"
                                    variant="outlined"
                                    size="small"
                                    sx={{ my: 1 }}
                                    fullWidth
                                    required
                                    onChange={e => {
                                        setName(e.target.value);
                                    }}
                                />
                            )}
                        />
                        <Typography variant="body1" data-loading sx={{ mt: 2 }}>
                            Set a password for your account.
                        </Typography>
                        <ConditionallyRender
                            condition={apiError && isValidToken}
                            show={<ResetPasswordError />}
                        />
                        {/* TODO: create-user failure message */}
                        <ResetPasswordForm
                            setLoading={setLoading}
                            onSubmit={onSubmit}
                        />
                    </>
                }
            />
        </NewUserWrapper>
    );
};
