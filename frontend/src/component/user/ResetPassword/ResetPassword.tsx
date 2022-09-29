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

const ResetPassword = () => {
    const { classes: styles } = useStyles();
    const { loading, setLoading, isValidToken, resetPassword } =
        useResetPassword();
    const ref = useLoading(loading);
    const navigate = useNavigate();
    const [hasApiError, setHasApiError] = useState(false);

    const onSubmit = async (password: string) => {
        setLoading(true);

        try {
            const res = await resetPassword(password);
            setLoading(false);
            if (res.status === OK) {
                navigate('/login?reset=true');
                setHasApiError(false);
            } else {
                setHasApiError(true);
            }
        } catch (e) {
            setHasApiError(true);
            setLoading(false);
        }
    };

    return (
        <div ref={ref}>
            <StandaloneLayout>
                <div className={styles.resetPassword}>
                    <ConditionallyRender
                        condition={!isValidToken}
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
