import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { Button, Textfield, DialogTitle, DialogContent, DialogActions } from 'react-mdl';
import { trim } from '../../../component/common/util';
import { modalStyles } from './util';

function ChangePassword({ showDialog, closeDialog, changePassword, validatePassword, user = {} }) {
    const [data, setData] = useState({});
    const [error, setError] = useState({});

    const updateField = e => {
        setData({
            ...data,
            [e.target.name]: trim(e.target.value),
        });
    };

    const submit = async e => {
        e.preventDefault();
        if (!data.password || data.password.length < 8) {
            setError({ password: 'You must specify a password with at least 8 chars.' });
            return;
        }
        if (!(data.password === data.confirm)) {
            setError({ confirm: 'Passwords does not match' });
            return;
        }

        try {
            await changePassword(user, data.password);
            setData({});
            closeDialog();
        } catch (error) {
            const msg = error.message || 'Could not update password';
            setError({ general: msg });
        }
    };

    const onPasswordBlur = async e => {
        e.preventDefault();
        setError({ password: '' });
        if (data.password) {
            try {
                await validatePassword(data.password);
            } catch (error) {
                const msg = error.message || '';
                setError({ password: msg });
            }
        }
    };

    const onCancel = e => {
        e.preventDefault();
        setData({});
        closeDialog();
    };

    return (
        <Modal isOpen={showDialog} style={modalStyles} onRequestClose={onCancel}>
            <form onSubmit={submit}>
                <DialogTitle>Update password</DialogTitle>
                <DialogContent>
                    <p>User: {user.username || user.email}</p>
                    <p style={{ color: 'red' }}>{error.general}</p>
                    <Textfield
                        floatingLabel
                        label="New passord"
                        name="password"
                        type="password"
                        value={data.password}
                        error={error.password}
                        onChange={updateField}
                        onBlur={onPasswordBlur}
                    />
                    <Textfield
                        floatingLabel
                        label="Confirm passord"
                        name="confirm"
                        type="password"
                        value={data.confirm}
                        error={error.confirm}
                        onChange={updateField}
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="button" raised colored type="submit">
                        Save
                    </Button>
                    <Button type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Modal>
    );
}

ChangePassword.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    changePassword: PropTypes.func.isRequired,
    validatePassword: PropTypes.func.isRequired,
    user: PropTypes.object,
};

export default ChangePassword;
