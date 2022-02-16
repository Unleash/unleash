import ConditionallyRender from '../../common/ConditionallyRender';
import { useStyles } from './Login.styles';
import useQueryParams from '../../../hooks/useQueryParams';
import ResetPasswordSuccess from '../common/ResetPasswordSuccess/ResetPasswordSuccess';
import StandaloneLayout from '../common/StandaloneLayout/StandaloneLayout';
import { DEMO_TYPE } from '../../../constants/authTypes';
import Authentication from '../Authentication/Authentication';
import { useAuthDetails } from '../../../hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from '../../../hooks/api/getters/useAuth/useAuthUser';
import { Redirect } from 'react-router-dom';

const Login = () => {
    const styles = useStyles();
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();
    const query = useQueryParams();
    const resetPassword = query.get('reset') === 'true';

    if (user) {
        return <Redirect to="/features" />;
    }

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
