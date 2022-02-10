import { useEffect } from 'react';
import ConditionallyRender from '../../common/ConditionallyRender';
import { useStyles } from './Login.styles';
import useQueryParams from '../../../hooks/useQueryParams';
import ResetPasswordSuccess from '../common/ResetPasswordSuccess/ResetPasswordSuccess';
import StandaloneLayout from '../common/StandaloneLayout/StandaloneLayout';
import { DEMO_TYPE } from '../../../constants/authTypes';
import { useHistory } from 'react-router';
import Authentication from "../Authentication/Authentication";
import { useAuthDetails } from '../../../hooks/api/getters/useAuth/useAuthDetails';
import { useAuthPermissions } from '../../../hooks/api/getters/useAuth/useAuthPermissions';

const Login = () => {
    const styles = useStyles();
    const { authDetails } = useAuthDetails();
    const { permissions } = useAuthPermissions();
    const query = useQueryParams();
    const history = useHistory();

    useEffect(() => {
        if (permissions?.length) {
            history.push('features');
        }
        /* eslint-disable-next-line */
    }, [permissions?.length]);

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
                <Authentication />
            </div>
        </StandaloneLayout>
    );
};

export default Login;
