import React, { useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Button, TextField, Typography, IconButton } from '@material-ui/core';
import ConditionallyRender from '../../common/ConditionallyRender';
import { useHistory } from 'react-router';
import { useCommonStyles } from '../../../common.styles';
import { useStyles } from './PasswordAuth.styles';
import { Link } from 'react-router-dom';
import useQueryParams from '../../../hooks/useQueryParams';

const PasswordAuth = ({ authDetails, passwordLogin }) => {
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    const history = useHistory();
    const [showFields, setShowFields] = useState(false);
    const params = useQueryParams();
    const [username, setUsername] = useState(params.get('email') || '');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({
        usernameError: '',
        passwordError: '',
    });

    const onShowOptions = e => {
        e.preventDefault();
        setShowFields(true);
    };

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

        const user = { username, password };
        const path = evt.target.action;

        try {
            await passwordLogin(path, user);

            history.push(`/`);
        } catch (error) {
            if (error.statusCode === 404 || error.statusCode === 400) {
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

    const renderLoginForm = () => {
        const { usernameError, passwordError, apiError } = errors;

        return (
            <form onSubmit={handleSubmit} action={authDetails.path}>
                <Typography variant="subtitle2" className={styles.apiError}>
                    {apiError}
                </Typography>
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
                        variant="outlined"
                        autoComplete="true"
                        size="small"
                    />
                    <TextField
                        label="Password"
                        onChange={evt => setPassword(evt.target.value)}
                        name="password"
                        type="password"
                        value={password}
                        error={!!passwordError}
                        helperText={passwordError}
                        variant="outlined"
                        autoComplete="true"
                        size="small"
                    />

                    <Link to="/forgotten-password">
                        <Typography variant="body2">
                            Forgot your password?
                        </Typography>
                    </Link>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        style={{ maxWidth: '150px' }}
                    >
                        Sign in
                    </Button>
                </div>
            </form>
        );
    };

    const renderWithOptions = options => (
        <div>
            {options.map(o => (
                <div
                    key={o.type}
                    className={classnames(
                        styles.contentContainer,
                        commonStyles.contentSpacingY
                    )}
                >
                    <Button color="primary" variant="contained" href={o.path}>
                        {o.message || o.value}
                    </Button>
                </div>
            ))}
            <ConditionallyRender
                condition={showFields}
                show={renderLoginForm()}
                elseShow={
                    <IconButton onClick={onShowOptions}>
                        {' '}
                        Show more options
                    </IconButton>
                }
            />
        </div>
    );

    const { options = [] } = authDetails;

    return (
        <div>
            <Typography variant="subtitle1">{authDetails.message}</Typography>
            <ConditionallyRender
                condition={options.length > 0}
                show={renderWithOptions(options)}
                elseShow={renderLoginForm()}
            />
        </div>
    );
};

PasswordAuth.propTypes = {
    authDetails: PropTypes.object.isRequired,
    passwordLogin: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
};

export default PasswordAuth;
