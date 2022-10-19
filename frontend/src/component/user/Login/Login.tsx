import { Navigate } from 'react-router-dom';
import { Alert, AlertTitle } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from 'component/user/Login/Login.styles';
import useQueryParams from 'hooks/useQueryParams';
import StandaloneLayout from '../common/StandaloneLayout/StandaloneLayout';
import { DEMO_TYPE } from 'constants/authTypes';
import Authentication from '../Authentication/Authentication';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { parseRedirectParam } from 'component/user/Login/parseRedirectParam';
import { useContext } from 'react';
import { AchievementContext } from 'component/achievements/AchievementContext/AchievementContext';
import { Achievement } from 'constants/achievements';

const Login = () => {
    const { classes: styles } = useStyles();
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();
    const query = useQueryParams();
    const resetPassword = query.get('reset') === 'true';
    const invited = query.get('invited') === 'true';
    const redirect = query.get('redirect') || '/';
    const { unlockAchievement } = useContext(AchievementContext);

    if (user) {
        unlockAchievement(Achievement.FIRST_LOGIN);
        return <Navigate to={parseRedirectParam(redirect)} replace />;
    }

    return (
        <StandaloneLayout>
            <div className={styles.loginFormContainer}>
                <ConditionallyRender
                    condition={resetPassword}
                    show={
                        <Alert severity="success" sx={{ mb: 4 }}>
                            <AlertTitle>Success</AlertTitle>
                            You successfully reset your password.
                        </Alert>
                    }
                />
                <ConditionallyRender
                    condition={invited}
                    show={
                        <Alert severity="success" sx={{ mb: 4 }}>
                            <AlertTitle>Success</AlertTitle>
                            Your account has been created.
                        </Alert>
                    }
                />
                <ConditionallyRender
                    condition={authDetails?.type !== DEMO_TYPE}
                    show={
                        <h2 className={styles.title}>
                            Login to continue the great work
                        </h2>
                    }
                />
                <Authentication redirect={redirect} />
            </div>
        </StandaloneLayout>
    );
};

export default Login;
