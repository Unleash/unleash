import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OK } from 'constants/statusCodes';
import useLoading from 'hooks/useLoading';
import { styled, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import InvalidToken from '../common/InvalidToken/InvalidToken.tsx';
import useResetPassword from 'hooks/api/getters/useResetPassword/useResetPassword';
import StandaloneLayout from '../common/StandaloneLayout.tsx';
import ResetPasswordForm from '../common/ResetPasswordForm/ResetPasswordForm.tsx';
import ResetPasswordError from '../common/ResetPasswordError/ResetPasswordError.tsx';
import { useAuthResetPasswordApi } from 'hooks/api/actions/useAuthResetPasswordApi/useAuthResetPasswordApi';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { formatUnknownError } from 'utils/formatUnknownError';

const StyledDiv = styled('div')(({ theme }) => ({
    width: '350px',
    maxWidth: '350px',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
}));

const ResetPassword = () => {
    const { token, loading, isValidToken } = useResetPassword();
    const { resetPassword, loading: actionLoading } = useAuthResetPasswordApi();
    const { authDetails } = useAuthDetails();
    const ref = useLoading(loading || actionLoading);
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('');
    const passwordDisabled = authDetails?.defaultHidden === true;

    const onSubmit = async (password: string) => {
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
        <div ref={ref}>
            <StandaloneLayout>
                <StyledDiv>
                    <ConditionallyRender
                        condition={!isValidToken || passwordDisabled}
                        show={<InvalidToken />}
                        elseShow={
                            <>
                                <StyledTypography variant='h2' data-loading>
                                    Reset password
                                </StyledTypography>

                                <ResetPasswordError>
                                    {apiError}
                                </ResetPasswordError>
                                <ResetPasswordForm onSubmit={onSubmit} />
                            </>
                        }
                    />
                </StyledDiv>
            </StandaloneLayout>
        </div>
    );
};

export default ResetPassword;
