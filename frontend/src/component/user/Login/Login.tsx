import { Navigate } from 'react-router-dom';
import { Alert, AlertTitle, styled, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useQueryParams from 'hooks/useQueryParams';
import Authentication from '../Authentication/Authentication.tsx';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { parseRedirectParam } from 'component/user/Login/parseRedirectParam';
import { getSessionStorageItem, setSessionStorageItem } from 'utils/storage';
import { DEMO_TYPE } from 'constants/authTypes';
import { useFlag } from '@unleash/proxy-client-react';
import DeprecatedLogin from './DeprecatedLogin';
import { AuthPageLayout } from '../common/AuthPageLayout';

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '28px',
    marginBottom: theme.spacing(3),
}));

const NewLogin = () => {
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();
    const query = useQueryParams();
    const resetPassword = query.get('reset') === 'true';
    const invited = query.get('invited') === 'true';
    const redirect =
        query.get('redirect') || getSessionStorageItem('login-redirect') || '/';

    if (user) {
        setSessionStorageItem('login-redirect');
        return <Navigate to={parseRedirectParam(redirect)} replace />;
    }

    return (
        <AuthPageLayout>
            <ConditionallyRender
                condition={resetPassword}
                show={
                    <Alert severity='success' sx={{ mb: 3 }}>
                        <AlertTitle>Success</AlertTitle>
                        You successfully reset your password.
                    </Alert>
                }
            />
            <ConditionallyRender
                condition={invited}
                show={
                    <Alert severity='success' sx={{ mb: 3 }}>
                        <AlertTitle>Success</AlertTitle>
                        Your account has been created.
                    </Alert>
                }
            />
            <ConditionallyRender
                condition={authDetails?.type !== DEMO_TYPE}
                show={<StyledTitle>Sign in to your instance</StyledTitle>}
            />
            <Authentication redirect={redirect} invited={invited} />
        </AuthPageLayout>
    );
};

const Login = () => {
    const newLogin = useFlag('newLogin');
    if (newLogin) {
        return <NewLogin />;
    }

    return <DeprecatedLogin />;
};

export default Login;
