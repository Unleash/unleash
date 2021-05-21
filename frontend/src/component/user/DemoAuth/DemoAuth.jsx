import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextField } from '@material-ui/core';

import styles from './DemoAuth.module.scss';

import { ReactComponent as Logo } from '../../../assets/img/logo.svg';

const DemoAuth = ({ demoLogin, history, authDetails }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = evt => {
        evt.preventDefault();
        const user = { email };
        const path = evt.target.action;

        demoLogin(path, user).then(() => history.push(`/`));
    };

    const handleChange = e => {
        const value = e.target.value;
        setEmail(value);
    };

    return (
        <form onSubmit={handleSubmit} action={authDetails.path}>
            <Logo className={styles.logo} />
            <div className={styles.container}>
                <h2>Access the Unleash demo instance</h2>
                <p>No further data or Credit Card required</p>
                <div className={styles.form}>
                    <TextField
                        value={email}
                        className={styles.emailField}
                        onChange={handleChange}
                        inputProps={{ 'data-test': 'email-input-field' }}
                        size="small"
                        variant="outlined"
                        label="Email"
                        name="email"
                        required
                        type="email"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        data-test="login-submit"
                        className={styles.button}
                    >
                        Sign in
                    </Button>
                </div>
                <p>
                    By accessing our demo instance, you agree to the
                    Unleash&nbsp;
                    <a
                        href="https://www.unleash-hosted.com/tos/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Customer Terms of Service
                    </a>{' '}
                    and&nbsp;
                    <a
                        href="https://www.unleash-hosted.com/privacy-policy/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Privacy Policy
                    </a>
                </p>
            </div>
        </form>
    );
};

DemoAuth.propTypes = {
    authDetails: PropTypes.object.isRequired,
    demoLogin: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
};

export default DemoAuth;
