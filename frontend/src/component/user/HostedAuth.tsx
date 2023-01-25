import { FormEventHandler, useState, VFC } from 'react';
import { Button, Grid, styled, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import useQueryParams from 'hooks/useQueryParams';
import AuthOptions from './common/AuthOptions/AuthOptions';
import DividerText from 'component/common/DividerText/DividerText';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PasswordField from 'component/common/PasswordField/PasswordField';
import { useAuthApi } from 'hooks/api/actions/useAuthApi/useAuthApi';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { LOGIN_BUTTON, LOGIN_EMAIL_ID, LOGIN_PASSWORD_ID } from 'utils/testIds';
import { IAuthEndpointDetailsResponse } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import { BadRequestError, NotFoundError } from 'utils/apiUtils';
import { contentSpacingY } from 'themes/themeStyles';

interface IHostedAuthProps {
    authDetails: IAuthEndpointDetailsResponse;
    redirect: string;
}

const StyledTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.error.main,
}));

const StyledDiv = styled('div')(({ theme }) => ({
    ...contentSpacingY(theme),
    display: 'flex',
    flexDirection: 'column',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    width: '150px',
    margin: theme.spacing(2, 'auto', 0, 'auto'),
    display: 'block',
    textAlign: 'center',
}));

const HostedAuth: VFC<IHostedAuthProps> = ({ authDetails, redirect }) => {
    const { refetchUser } = useAuthUser();
    const navigate = useNavigate();
    const params = useQueryParams();
    const { passwordAuth } = useAuthApi();
    const [username, setUsername] = useState(params.get('email') || '');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{
        usernameError?: string;
        passwordError?: string;
        apiError?: string;
    }>({});

    const handleSubmit: FormEventHandler<HTMLFormElement> = async evt => {
        evt.preventDefault();

        if (!username) {
            setErrors(prev => ({
                ...prev,
                usernameError: 'This is a required field',
            }));
        }
        if (!password) {
            setErrors(prev => ({
                ...prev,
                passwordError: 'This is a required field',
            }));
        }

        if (!password || !username) {
            return;
        }

        try {
            await passwordAuth(authDetails.path, username, password);
            refetchUser();
            navigate(redirect, { replace: true });
        } catch (error: any) {
            if (
                error instanceof NotFoundError ||
                error instanceof BadRequestError
            ) {
                setErrors(prev => ({
                    ...prev,
                    apiError: 'Invalid login details',
                }));
                setPassword('');
                setUsername('');
            } else {
                setErrors({
                    apiError: 'Unknown error while trying to authenticate.',
                });
            }
        }
    };

    const { usernameError, passwordError, apiError } = errors;
    const { options = [] } = authDetails;

    return (
        <>
            <ConditionallyRender
                condition={options.length > 0}
                show={
                    <>
                        <AuthOptions options={options} />
                        <DividerText text="or signin with username" />
                    </>
                }
            />

            <ConditionallyRender
                condition={!authDetails.defaultHidden}
                show={
                    <form onSubmit={handleSubmit}>
                        <StyledTypography variant="subtitle2">
                            {apiError}
                        </StyledTypography>
                        <StyledDiv>
                            <TextField
                                label="Username or email"
                                name="username"
                                id="username"
                                type="text"
                                onChange={evt => setUsername(evt.target.value)}
                                value={username}
                                error={Boolean(usernameError)}
                                helperText={usernameError}
                                variant="outlined"
                                size="small"
                                data-testid={LOGIN_EMAIL_ID}
                            />
                            <PasswordField
                                label="Password"
                                onChange={evt => setPassword(evt.target.value)}
                                name="password"
                                id="password"
                                value={password}
                                error={Boolean(passwordError)}
                                helperText={passwordError}
                                autoComplete="current-password"
                                data-testid={LOGIN_PASSWORD_ID}
                            />
                            <Grid container>
                                <StyledButton
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    data-testid={LOGIN_BUTTON}
                                >
                                    Sign in
                                </StyledButton>
                            </Grid>
                        </StyledDiv>
                    </form>
                }
            />
        </>
    );
};

export default HostedAuth;
