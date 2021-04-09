import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Dialogue from '../../../component/common/Dialogue';
import UserForm from './user-form';

function AddUser({ showDialog, closeDialog, addUser, roles }) {
    const [data, setData] = useState({});
    const [error, setError] = useState({});

    const submit = async e => {
        e.preventDefault();
        if (!data.email) {
            setError({ general: 'You must specify the email address' });
            return;
        }

        if (!data.rootRole) {
            setError({ general: 'You must specify a role for the user' });
            return;
        }

        try {
            await addUser(data);
            setData({});
            setError({});
            closeDialog();
        } catch (error) {
            const msg = error.message || 'Could not create user';
            setError({ general: msg });
        }
    };

    const onCancel = e => {
        e.preventDefault();
        setData({});
        setError({});
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
            fullWidth
        >
            <UserForm title="Add new user" data={data} setData={setData} roles={roles} submit={submit} error={error} />
        </Dialogue>
    );
}

AddUser.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    addUser: PropTypes.func.isRequired,
    validatePassword: PropTypes.func.isRequired,
    roles: PropTypes.array.isRequired,
};

export default AddUser;
