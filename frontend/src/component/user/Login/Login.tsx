import { useEffect } from 'react';

import AuthenticationContainer from '../Authentication';
import ConditionallyRender from '../../common/ConditionallyRender';

import { useStyles } from './Login.styles';
import useQueryParams from '../../../hooks/useQueryParams';
import ResetPasswordSuccess from '../common/ResetPasswordSuccess/ResetPasswordSuccess';
import StandaloneLayout from '../common/StandaloneLayout/StandaloneLayout';
import { DEMO_TYPE } from '../../../constants/authTypes';
import useUser from '../../../hooks/api/getters/useUser/useUser';
import { useHistory } from 'react-router';

const Login = () => {
    const styles = useStyles();
    const { permissions, authDetails } = useUser();
    const query = useQueryParams();
    const history = useHistory();

    useEffect(() => {
        if (permissions?.length > 0) {
            history.push('features');
        }
        /* eslint-disable-next-line */
    }, [permissions.length]);

    const resetPassword = query.get('reset') === 'true';
    return (
        <StandaloneLayout>
            <div className={styles.loginFormContainer}>
                <ConditionallyRender
                    condition={authDetails?.type !== DEMO_TYPE}
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
