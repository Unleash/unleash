import React, { useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Button, Grid, TextField, Typography } from '@material-ui/core';
import LockRounded from '@material-ui/icons/LockRounded';
import { useHistory } from 'react-router';
import { useCommonStyles } from '../../../common.styles';
import { useStyles } from './HostedAuth.styles';
import { Link } from 'react-router-dom';
import { GoogleSvg } from './Icons';
import useQueryParams from '../../../hooks/useQueryParams';

const PasswordAuth = ({ authDetails, passwordLogin }) => {
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    const history = useHistory();
    const params = useQueryParams();
    const [username, setUsername] = useState(params.get('email') || '');
    const [password, setPassword] = useState('');
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

 
    const { usernameError, passwordError, apiError } = errors;
    const { options = [] } = authDetails;

    return (
        <div>
            <br />
            <div>
                {options.map(o => (
                    <div
                        key={o.type}
                        className={classnames(
                            styles.contentContainer,
                            commonStyles.contentSpacingY
                        )}
                    >
                        <Button color="primary" variant="outlined" href={o.path} startIcon={o.type === 'google' ? <GoogleSvg /> : <LockRounded />}>
                            {o.message}
                        </Button>
                    </div>
                ))}
            </div>
            <p className={styles.fancyLine}>or</p>
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
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                style={{ maxWidth: '150px' }}
                            >
                                Sign in
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Link to="/forgotten-password">
                                <Typography variant="body2" align="right">
                                    Forgot your password?
                                </Typography>
                            </Link>
                        </Grid>
                    </Grid>
                    <br />
                    <br />
                    <Typography variant="body2" align="center">Don't have an account? <br /> <a href="https://www.unleash-hosted.com/pricing">Sign up</a></Typography>
                   
                    
                </div>
            </form>
        </div>
    );
};

PasswordAuth.propTypes = {
    authDetails: PropTypes.object.isRequired,
    passwordLogin: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
};

export default PasswordAuth;
