import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OK } from 'constants/statusCodes';
import useLoading from 'hooks/useLoading';
import { useStyles } from './ResetPassword.styles';
import { Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import InvalidToken from '../common/InvalidToken/InvalidToken';
import useResetPassword from 'hooks/api/getters/useResetPassword/useResetPassword';
import StandaloneLayout from '../common/StandaloneLayout/StandaloneLayout';
import ResetPasswordForm from '../common/ResetPasswordForm/ResetPasswordForm';
import ResetPasswordError from '../common/ResetPasswordError/ResetPasswordError';
import { useAuthResetPasswordApi } from 'hooks/api/actions/useAuthResetPasswordApi/useAuthResetPasswordApi';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';

const ResetPassword = () => {
    const { classes: styles } = useStyles();
    const { token, loading, isValidToken } = useResetPassword();
    const { resetPassword, loading: actionLoading } = useAuthResetPasswordApi();
    const { authDetails } = useAuthDetails();
    const ref = useLoading(loading || actionLoading);
    const navigate = useNavigate();
    const [hasApiError, setHasApiError] = useState(false);
    const passwordDisabled = authDetails?.defaultHidden === true;

    const onSubmit = async (password: string) => {
        try {
            const res = await resetPassword({ token, password });
            if (res.status === OK) {
                navigate('/login?reset=true');
                setHasApiError(false);
            } else {
                setHasApiError(true);
            }
        } catch (e) {
            setHasApiError(true);
        }
    };

    return (
        <div ref={ref}>
            <StandaloneLayout>
                <div className={styles.resetPassword}>
                    <ConditionallyRender
                        condition={!isValidToken || passwordDisabled}
                        show={<InvalidToken />}
                        elseShow={
                            <>
                                <Typography
                                    variant="h2"
                                    className={styles.title}
                                    data-loading
                                >
                                    Reset password
                                </Typography>

                                <ConditionallyRender
                                    condition={hasApiError}
                                    show={<ResetPasswordError />}
                                />
                                <ResetPasswordForm onSubmit={onSubmit} />
                            </>
                        }
                    />
                </div>
            </StandaloneLayout>
        </div>
    );
};

export default ResetPassword;
