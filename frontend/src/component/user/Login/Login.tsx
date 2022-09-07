import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from 'component/user/Login/Login.styles';
import useQueryParams from 'hooks/useQueryParams';
import ResetPasswordSuccess from '../common/ResetPasswordSuccess/ResetPasswordSuccess';
import StandaloneLayout from '../common/StandaloneLayout/StandaloneLayout';
import { DEMO_TYPE } from 'constants/authTypes';
import Authentication from '../Authentication/Authentication';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { Navigate } from 'react-router-dom';
import { parseRedirectParam } from 'component/user/Login/parseRedirectParam';

const Login = () => {
    const { classes: styles } = useStyles();
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();
    const query = useQueryParams();
    const resetPassword = query.get('reset') === 'true';
    const redirect = query.get('redirect') || '/';

    if (user) {
        return <Navigate to={parseRedirectParam(redirect)} replace />;
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
                <Authentication redirect={redirect} />
            </div>
        </StandaloneLayout>
    );
};

export default Login;
