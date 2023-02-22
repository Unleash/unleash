import { Navigate } from 'react-router-dom';
import { Alert, AlertTitle, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useQueryParams from 'hooks/useQueryParams';
import StandaloneLayout from '../common/StandaloneLayout';
import { DEMO_TYPE } from 'constants/authTypes';
import Authentication from '../Authentication/Authentication';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { parseRedirectParam } from 'component/user/Login/parseRedirectParam';

const StyledDiv = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
}));

const StyledHeader = styled('h2')(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginBottom: theme.spacing(2),
    textAlign: 'center',
}));

const Login = () => {
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();
    const query = useQueryParams();
    const resetPassword = query.get('reset') === 'true';
    const invited = query.get('invited') === 'true';
    const redirect = query.get('redirect') || '/';

    if (user) {
        return <Navigate to={parseRedirectParam(redirect)} replace />;
    }

    return (
        <StandaloneLayout>
            <StyledDiv>
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
                        <StyledHeader>
                            Log in to continue the great work
                        </StyledHeader>
                    }
                />
                <Authentication redirect={redirect} invited={invited} />
            </StyledDiv>
        </StandaloneLayout>
    );
};

export default Login;
