import { useEffect } from 'react';

import AuthenticationContainer from '../authentication-container';
import ConditionallyRender from '../../common/ConditionallyRender';

import { useStyles } from './Login.styles';
import useQueryParams from '../../../hooks/useQueryParams';
import ResetPasswordSuccess from '../common/ResetPasswordSuccess/ResetPasswordSuccess';
import StandaloneLayout from '../common/StandaloneLayout/StandaloneLayout';

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
            <div>
                <h2 className={styles.title}>Login</h2>
                <ConditionallyRender
                    condition={resetPassword}
                    show={<ResetPasswordSuccess />}
                />
                <div className={styles.loginFormContainer}>
                    <AuthenticationContainer history={history} />
                </div>
            </div>
        </StandaloneLayout>
    );
};

export default Login;
