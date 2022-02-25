import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextField } from '@material-ui/core';
import styles from './SimpleAuth.module.scss';
import { useHistory } from 'react-router-dom';
import { useAuthApi } from '../../../hooks/api/actions/useAuthApi/useAuthApi';
import { useAuthUser } from '../../../hooks/api/getters/useAuth/useAuthUser';
import { LOGIN_BUTTON, LOGIN_EMAIL_ID } from '../../../testIds';
import useToast from '../../../hooks/useToast';
import { formatUnknownError } from '../../../utils/format-unknown-error';

const SimpleAuth = ({ authDetails }) => {
    const [email, setEmail] = useState('');
    const { refetchUser } = useAuthUser();
    const { emailAuth } = useAuthApi();
    const history = useHistory();
    const { setToastApiError } = useToast();

    const handleSubmit = async evt => {
        evt.preventDefault();

        try {
            await emailAuth(authDetails.path, email);
            refetchUser();
            history.push(`/`);
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const handleChange = e => {
        const value = e.target.value;
        setEmail(value);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.container}>
                <p>{authDetails.message}</p>
                <p>
                    This instance of Unleash is not set up with a secure
                    authentication provider. You can read more about{' '}
                    <a
                        href="https://github.com/Unleash/unleash/blob/master/docs/securing-unleash.md"
                        target="_blank"
                        rel="noreferrer"
                    >
                        securing Unleash on GitHub
                    </a>
                </p>
                <TextField
                    value={email}
                    onChange={handleChange}
                    inputProps={{ 'data-test': 'email-input-field' }}
                    size="small"
                    variant="outlined"
                    label="Email"
                    name="email"
                    required
                    type="email"
                    data-test={LOGIN_EMAIL_ID}
                />
                <br />

                <div>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={styles.button}
                        data-test={LOGIN_BUTTON}
                    >
                        Sign in
                    </Button>
                </div>
            </div>
        </form>
    );
};

SimpleAuth.propTypes = {
    authDetails: PropTypes.object.isRequired,
};

export default SimpleAuth;
