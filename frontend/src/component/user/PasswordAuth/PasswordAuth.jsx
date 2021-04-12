import React, { useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {
    CardActions,
    Button,
    TextField,
    Typography,
    IconButton,
} from '@material-ui/core';
import ConditionallyRender from '../../common/ConditionallyRender';
import { useHistory } from 'react-router';
import { useCommonStyles } from '../../../common.styles';
import { useStyles } from './PasswordAuth.styles';

const PasswordAuth = ({ authDetails, passwordLogin, loadInitialData }) => {
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    const history = useHistory();
    const [showFields, setShowFields] = useState(false);
    const [username, setUsername] = useState('');
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
            await loadInitialData();
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
            <form
                onSubmit={handleSubmit}
                action={authDetails.path}
                className={styles.loginContainer}
            >
                <Typography variant="subtitle1">
                    {authDetails.message}
                </Typography>
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
                        size="small"
                    />

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
        <div style={{ textAlign: 'center' }}>
            {options.map(o => (
                <CardActions key={o.type}>
                    <Button raised accent href={o.path}>
                        {o.value}
                    </Button>
                </CardActions>
            ))}
            <ConditionallyRender
                condition={showFields}
                show={renderLoginForm()}
                elseShow={
                    <IconButton>
                        {' '}
                        onClick={onShowOptions} Show more options
                    </IconButton>
                }
            />
        </div>
    );

    const { options = [] } = authDetails;

    return (
        <ConditionallyRender
            condition={options.length > 0}
            show={renderWithOptions(options)}
            elseShow={renderLoginForm()}
        />
    );
};

PasswordAuth.propTypes = {
    authDetails: PropTypes.object.isRequired,
    passwordLogin: PropTypes.func.isRequired,
    loadInitialData: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
};

export default PasswordAuth;
