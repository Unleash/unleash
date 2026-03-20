import { type SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OK } from 'constants/statusCodes';
import useLoading from 'hooks/useLoading';
import { Button, styled, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import InvalidToken from '../common/InvalidToken/InvalidToken.tsx';
import useResetPassword from 'hooks/api/getters/useResetPassword/useResetPassword';
import ResetPasswordError from '../common/ResetPasswordError/ResetPasswordError.tsx';
import { useAuthResetPasswordApi } from 'hooks/api/actions/useAuthResetPasswordApi/useAuthResetPasswordApi';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useFlag } from '@unleash/proxy-client-react';
import DeprecatedResetPassword from './DeprecatedResetPassword';
import { AuthPageLayout } from '../common/AuthPageLayout';
import PasswordField from 'component/common/PasswordField/PasswordField';
import { PasswordRequirementsChecker } from '../common/PasswordRequirementsChecker/PasswordRequirementsChecker';

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '28px',
    marginBottom: theme.spacing(3),
}));

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1),
}));

const NewResetPassword = () => {
    const { token, loading, isValidToken } = useResetPassword();
    const { resetPassword, loading: actionLoading } = useAuthResetPasswordApi();
    const { authDetails } = useAuthDetails();
    const ref = useLoading(loading || actionLoading);
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [isValidPassword, setIsValidPassword] = useState(false);
    const [apiError, setApiError] = useState('');
    const passwordDisabled = authDetails?.defaultHidden === true;

    const onSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!isValidPassword) return;

        try {
            const res = await resetPassword({ token, password });
            if (res.status === OK) {
                navigate('/login?reset=true');
                setApiError('');
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

    return (
        <AuthPageLayout>
            <div ref={ref}>
                <ConditionallyRender
                    condition={!isValidToken || passwordDisabled}
                    show={<InvalidToken />}
                    elseShow={
                        <StyledForm onSubmit={onSubmit}>
                            <StyledTitle variant='h2' data-loading>
                                Reset password
                            </StyledTitle>
                            <ResetPasswordError>{apiError}</ResetPasswordError>
                            <div>
                                <StyledLabel variant='body1'>
                                    New password
                                </StyledLabel>
                                <PasswordField
                                    placeholder='New password'
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete='new-password'
                                    fullWidth
                                    data-loading
                                />
                            </div>
                            <PasswordRequirementsChecker
                                password={password}
                                setIsValidPassword={setIsValidPassword}
                            />
                            <Button
                                variant='contained'
                                type='submit'
                                color='primary'
                                disabled={!isValidPassword}
                                fullWidth
                                data-loading
                            >
                                Set new password
                            </Button>
                        </StyledForm>
                    }
                />
            </div>
        </AuthPageLayout>
    );
};

const ResetPassword = () => {
    const newLogin = useFlag('newLogin');
    if (newLogin) {
        return <NewResetPassword />;
    }
    return <DeprecatedResetPassword />;
};

export default ResetPassword;
