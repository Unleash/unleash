import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    TextField,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    Radio,
    Modal,
} from '@material-ui/core';
import { showPermissions, modalStyles } from './util';

function AddUser({ user, showDialog, closeDialog, updateUser }) {
    if (!user) {
        return null;
    }

    const [data, setData] = useState(user);
    const [error, setError] = useState({});

    const updateField = e => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const submit = async e => {
        e.preventDefault();

        try {
            await updateUser(data);
            closeDialog();
        } catch (error) {
            setError({ general: 'Could not create user' });
        }
    };

    const onCancel = e => {
        e.preventDefault();
        closeDialog();
    };

    const userType = data.userType || showPermissions(user.permissions);

    return (
        <Modal open={showDialog} style={modalStyles} onClose={onCancel}>
            <form onSubmit={submit}>
                <DialogTitle>Edit user</DialogTitle>

                <DialogContent>
                    <p>{error.general}</p>
                    <TextField
                        label="Full name"
                        name="name"
                        value={data.name}
                        error={error.name}
                        type="name"
                        onChange={updateField}
                    />
                    <TextField
                        label="Email"
                        name="email"
                        contentEditable="false"
                        editable="false"
                        readOnly
                        value={data.email}
                        type="email"
                    />
                    <br />
                    <br />
                    <RadioGroup name="userType" value={userType} onChange={updateField} childContainer="div">
                        <Radio value="regular" ripple>
                            Regular user
                        </Radio>
                        <Radio value="admin" ripple>
                            Admin user
                        </Radio>
                        <Radio value="read" ripple>
                            Read only
                        </Radio>
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <Button raised colored type="submit">
                        Update
                    </Button>
                    <Button type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Modal>
    );
}

AddUser.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    user: PropTypes.object,
};

export default AddUser;
