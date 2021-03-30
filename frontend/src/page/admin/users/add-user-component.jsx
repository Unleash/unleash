import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Dialogue from '../../../component/common/Dialogue';
import {
    TextField,
    DialogTitle,
    DialogContent,
    RadioGroup,
    Radio,
    FormControl,
    FormControlLabel,
    FormLabel,
} from '@material-ui/core';
import { trim } from '../../../component/common/util';
import commonStyles from '../../../component/common/common.module.scss';

const EMPTY = { userType: 'regular' };

function AddUser({ showDialog, closeDialog, addUser, validatePassword }) {
    const [data, setData] = useState(EMPTY);
    const [error, setError] = useState({});

    const updateField = e => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const updateFieldWithTrim = e => {
        setData({
            ...data,
            [e.target.name]: trim(e.target.value),
        });
    };

    const submit = async e => {
        e.preventDefault();
        if (!data.email) {
            setError({ general: 'You must specify the email adress' });
            return;
        }

        try {
            await addUser(data);
            setData(EMPTY);
            closeDialog();
        } catch (error) {
            const msg = error.message || 'Could not create user';
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
        setData(EMPTY);
        closeDialog();
    };

    return (
        <Dialogue
            onClick={e => {
                submit(e);
            }}
            open={showDialog}
            onClose={onCancel}
            primaryButtonText="Add user"
            secondaryButtonText="Cancel"
        >
            <form onSubmit={submit}>
                <DialogTitle>Add new user</DialogTitle>

                <DialogContent
                    className={commonStyles.contentSpacing}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    <p style={{ color: 'red' }}>{error.general}</p>
                    <TextField
                        label="Full name"
                        name="name"
                        value={data.name}
                        error={error.name !== undefined}
                        helperText={error.name}
                        type="name"
                        variant="outlined"
                        size="small"
                        onChange={updateField}
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={data.email}
                        error={error.email !== undefined}
                        helperText={error.email}
                        type="email"
                        variant="outlined"
                        size="small"
                        onChange={updateFieldWithTrim}
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={data.password}
                        error={error.password !== undefined}
                        helperText={error.password}
                        variant="outlined"
                        size="small"
                        onChange={updateField}
                        onBlur={onPasswordBlur}
                    />
                    <br />
                    <br />
                    <FormControl>
                        <FormLabel component="legend">User type</FormLabel>
                        <RadioGroup name="userType" value={data.userType} onChange={updateField}>
                            <FormControlLabel label="Regular" control={<Radio />} value="regular" />
                            <FormControlLabel label="Admin" control={<Radio />} value="admin" />
                            <FormControlLabel label="Read-only" control={<Radio />} value="read" />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
            </form>
        </Dialogue>
    );
}

AddUser.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    addUser: PropTypes.func.isRequired,
    validatePassword: PropTypes.func.isRequired,
};

export default AddUser;
