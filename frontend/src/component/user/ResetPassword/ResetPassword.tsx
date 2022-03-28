import useLoading from 'hooks/useLoading';

import ResetPasswordDetails from '../common/ResetPasswordDetails/ResetPasswordDetails';

import { useStyles } from './ResetPassword.styles';
import { Typography } from '@material-ui/core';
import ConditionallyRender from 'component/common/ConditionallyRender';
import InvalidToken from '../common/InvalidToken/InvalidToken';
import useResetPassword from 'hooks/api/getters/useResetPassword/useResetPassword';
import StandaloneLayout from '../common/StandaloneLayout/StandaloneLayout';

const ResetPassword = () => {
    const styles = useStyles();
    const { token, loading, setLoading, invalidToken } = useResetPassword();
    const ref = useLoading(loading);

    return (
        <div ref={ref}>
            <StandaloneLayout>
                <div className={styles.resetPassword}>
                    <ConditionallyRender
                        condition={invalidToken}
                        show={<InvalidToken />}
                        elseShow={
                            <ResetPasswordDetails
                                token={token}
                                setLoading={setLoading}
                            >
                                <Typography
                                    variant="h2"
                                    className={styles.title}
                                    data-loading
                                >
                                    Reset password
                                </Typography>
                            </ResetPasswordDetails>
                        }
                    />
                </div>
            </StandaloneLayout>
        </div>
    );
};

export default ResetPassword;
