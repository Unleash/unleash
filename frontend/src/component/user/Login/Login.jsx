import { useEffect } from 'react';

import AuthenticationContainer from '../authentication-container';
import ConditionallyRender from '../../common/ConditionallyRender';

import { useStyles } from './Login.styles';
import useQueryParams from '../../../hooks/useQueryParams';
import ResetPasswordSuccess from '../common/ResetPasswordSuccess/ResetPasswordSuccess';
import StandaloneLayout from '../common/StandaloneLayout/StandaloneLayout';
import { DEMO_TYPE } from '../../../constants/authTypes';

const Login = ({ history, user, fetchUser }) => {
    const styles = useStyles();
    const query = useQueryParams();

    useEffect(() => {
        fetchUser();
        /* eslint-disable-next-line */
    }, []);

    useEffect(() => {
        if (user.permissions.length > 0) {
            history.push('features');
        }
        /* eslint-disable-next-line */
    }, [user.permissions]);

    const resetPassword = query.get('reset') === 'true';

    return (
        <StandaloneLayout>
            <div className={styles.loginFormContainer}>
                <ConditionallyRender
                    condition={user?.authDetails?.type !== DEMO_TYPE}
                    show={
                        <h2 className={styles.title}>
                            Login to continue the great work
                        </h2>
                    }
                />

                <ConditionallyRender
                    condition={resetPassword}
                    show={<ResetPasswordSuccess />}
                />
                <AuthenticationContainer history={history} />
            </div>
        </StandaloneLayout>
    );
};

export default Login;
