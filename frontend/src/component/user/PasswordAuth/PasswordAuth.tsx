import { FormEventHandler, useState, VFC } from 'react';
import classnames from 'classnames';
import { Button, TextField } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useNavigate } from 'react-router';
import { useThemeStyles } from 'themes/themeStyles';
import { useStyles } from './PasswordAuth.styles';
import useQueryParams from 'hooks/useQueryParams';
import AuthOptions from '../common/AuthOptions/AuthOptions';
import DividerText from 'component/common/DividerText/DividerText';
import { Alert } from '@mui/material';
import { LOGIN_BUTTON, LOGIN_EMAIL_ID, LOGIN_PASSWORD_ID } from 'utils/testIds';
import PasswordField from 'component/common/PasswordField/PasswordField';
import { useAuthApi } from 'hooks/api/actions/useAuthApi/useAuthApi';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { IAuthEndpointDetailsResponse } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import {
    AuthenticationError,
    BadRequestError,
    NotFoundError,
} from 'utils/apiUtils';

interface IPasswordAuthProps {
    authDetails: IAuthEndpointDetailsResponse;
    redirect: string;
}

const PasswordAuth: VFC<IPasswordAuthProps> = ({ authDetails, redirect }) => {
    const { classes: themeStyles } = useThemeStyles();
    const { classes: styles } = useStyles();
    const navigate = useNavigate();
    const { refetchUser } = useAuthUser();
    const params = useQueryParams();
    const [username, setUsername] = useState(params.get('email') || '');
    const [password, setPassword] = useState('');
    const { passwordAuth } = useAuthApi();
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
            navigate(redirect);
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
            } else if (error instanceof AuthenticationError) {
                setErrors({
                    apiError: 'Invalid password and username combination.',
                });
            } else {
                setErrors({
                    apiError: 'Unknown error while trying to authenticate.',
                });
            }
        }
    };

    const renderLoginForm = () => {
        const { usernameError, passwordError, apiError } = errors;

        return (
            <ConditionallyRender
                condition={!authDetails.defaultHidden}
                show={
                    <form onSubmit={handleSubmit}>
                        <ConditionallyRender
                            condition={Boolean(apiError)}
                            show={
                                <Alert
                                    severity="error"
                                    className={styles.apiError}
                                >
                                    {apiError}
                                </Alert>
                            }
                        />

                        <div
                            className={classnames(
                                styles.contentContainer,
                                themeStyles.contentSpacingY
                            )}
                        >
                            <TextField
                                label="Username or email"
                                name="username"
                                id="username"
                                type="text"
                                onChange={evt => setUsername(evt.target.value)}
                                value={username}
                                error={Boolean(usernameError)}
                                helperText={usernameError}
                                autoComplete="username"
                                data-testid={LOGIN_EMAIL_ID}
                                variant="outlined"
                                size="small"
                                autoFocus
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
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                style={{ width: '150px', margin: '1rem auto' }}
                                data-testid={LOGIN_BUTTON}
                            >
                                Sign in
                            </Button>
                        </div>
                    </form>
                }
            />
        );
    };

    const { options = [] } = authDetails;

    return (
        <>
            <ConditionallyRender
                condition={options.length > 0}
                show={
                    <>
                        <AuthOptions options={options} />
                        <ConditionallyRender
                            condition={!authDetails.defaultHidden}
                            show={
                                <DividerText text="Or sign in with username" />
                            }
                        />
                        {renderLoginForm()}
                    </>
                }
                elseShow={renderLoginForm()}
            />
        </>
    );
};

export default PasswordAuth;
