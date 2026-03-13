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
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import loginBackground from 'assets/img/loginBackground.png';

const StyledPage = styled('div')(({ theme }) => ({
    minHeight: '100vh',
    backgroundColor: theme.palette.background.application,
}));

const StyledBackground = styled('img')({
    position: 'absolute',
    right: 0,
    width: '70%',
    maxHeight: '100%',
    objectFit: 'contain',
    objectPosition: 'bottom right',
});

const StyledHeader = styled('header')(({ theme }) => ({
    padding: theme.spacing(3),
}));

const StyledLogo = styled(UnleashLogo)({
    width: 150,
});

const StyledMain = styled('main')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
}));

const StyledCardWrapper = styled('div')({
    position: 'relative',
    width: 500,
});

const StyledSquare = styled('div')<{
    size: number;
    color: string;
}>(({ size, color }) => ({
    position: 'absolute',
    width: size,
    height: size,
    backgroundColor: color,
}));

const StyledCard = styled('div')(({ theme }) => ({
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(5, 4),
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3, 2),
    },
}));

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
        <StyledPage>
            <StyledBackground src={loginBackground} alt='' />
            <StyledHeader>
                <StyledLogo aria-label='Unleash logo' />
            </StyledHeader>
            <StyledMain>
                <StyledCardWrapper>
                    <StyledSquare
                        size={8}
                        color='#B3DAED'
                        sx={{ top: -20, left: -20 }}
                    />
                    <StyledSquare
                        size={24}
                        color='#98E3AF'
                        sx={{ top: -12, left: -12 }}
                    />
                    <StyledSquare
                        size={24}
                        color='#6c65e5'
                        sx={{ bottom: -12, right: -12 }}
                    />
                    <StyledSquare
                        size={8}
                        color='#ffffff'
                        sx={{ bottom: -20, right: -20 }}
                    />
                    <StyledCard>
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
                            show={
                                <StyledTitle>
                                    Sign in to your instance
                                </StyledTitle>
                            }
                        />
                        <Authentication
                            redirect={redirect}
                            invited={invited}
                        />
                    </StyledCard>
                </StyledCardWrapper>
            </StyledMain>
        </StyledPage>
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
