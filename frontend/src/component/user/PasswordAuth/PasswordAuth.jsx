import { useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Button, TextField } from '@material-ui/core';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { useHistory } from 'react-router';
import { useCommonStyles } from 'themes/commonStyles';
import { useStyles } from './PasswordAuth.styles';
import useQueryParams from 'hooks/useQueryParams';
import AuthOptions from '../common/AuthOptions/AuthOptions';
import DividerText from 'component/common/DividerText/DividerText';
import { Alert } from '@material-ui/lab';
import { LOGIN_BUTTON, LOGIN_EMAIL_ID, LOGIN_PASSWORD_ID } from 'utils/testIds';
import PasswordField from 'component/common/PasswordField/PasswordField';
import { useAuthApi } from 'hooks/api/actions/useAuthApi/useAuthApi';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

const PasswordAuth = ({ authDetails, redirect }) => {
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    const history = useHistory();
    const { refetchUser } = useAuthUser();
    const params = useQueryParams();
    const [username, setUsername] = useState(params.get('email') || '');
    const [password, setPassword] = useState('');
    const { passwordAuth } = useAuthApi();
    const [errors, setErrors] = useState({
        usernameError: '',
        passwordError: '',
    });

    const handleSubmit = async evt => {
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
            history.push(redirect);
        } catch (error) {
            if (error.statusCode === 404 || error.statusCode === 400) {
                setErrors(prev => ({
                    ...prev,
                    apiError: 'Invalid login details',
                }));
                setPassword('');
                setUsername('');
            } else if (error.statusCode === 401) {
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
                            condition={apiError}
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
                                commonStyles.contentSpacingY
                            )}
                        >
                            <TextField
                                label="Username or email"
                                name="username"
                                type="string"
                                onChange={evt => setUsername(evt.target.value)}
                                value={username}
                                error={!!usernameError}
                                helperText={usernameError}
                                autoComplete="true"
                                data-testid={LOGIN_EMAIL_ID}
                                variant="outlined"
                                size="small"
                            />
                            <PasswordField
                                label="Password"
                                onChange={evt => setPassword(evt.target.value)}
                                name="password"
                                value={password}
                                error={!!passwordError}
                                helperText={passwordError}
                                autoComplete="true"
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

    const renderWithOptions = options => (
        <>
            <AuthOptions options={options} />
            <ConditionallyRender
                condition={!authDetails.defaultHidden}
                show={<DividerText text="Or sign in with username" />}
            />
            {renderLoginForm()}
        </>
    );

    const { options = [] } = authDetails;

    return (
        <>
            <ConditionallyRender
                condition={options.length > 0}
                show={renderWithOptions(options)}
                elseShow={renderLoginForm()}
            />
        </>
    );
};

PasswordAuth.propTypes = {
    authDetails: PropTypes.object.isRequired,
    redirect: PropTypes.string.isRequired,
};

export default PasswordAuth;
