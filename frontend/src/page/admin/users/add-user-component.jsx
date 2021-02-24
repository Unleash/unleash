import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { Button, Textfield, DialogTitle, DialogContent, DialogActions, RadioGroup, Radio } from 'react-mdl';
import { trim } from '../../../component/common/util';
import { modalStyles } from './util';

Modal.setAppElement('#app');

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
        <Modal isOpen={showDialog} style={modalStyles} onRequestClose={onCancel}>
            <form onSubmit={submit}>
                <DialogTitle>Add new user</DialogTitle>

                <DialogContent>
                    <p style={{ color: 'red' }}>{error.general}</p>
                    <Textfield
                        floatingLabel
                        label="Full name"
                        name="name"
                        value={data.name}
                        error={error.name}
                        type="name"
                        onChange={updateField}
                    />
                    <Textfield
                        floatingLabel
                        label="Email"
                        name="email"
                        value={data.email}
                        error={error.email}
                        type="email"
                        onChange={updateFieldWithTrim}
                    />
                    <Textfield
                        floatingLabel
                        label="Password"
                        name="password"
                        type="password"
                        value={data.password}
                        error={error.password}
                        onChange={updateField}
                        onBlur={onPasswordBlur}
                    />
                    <br />
                    <br />
                    <RadioGroup name="userType" value={data.userType} onChange={updateField} childContainer="div">
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
                    <Button type="button" raised colored type="submit">
                        Add
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
    addUser: PropTypes.func.isRequired,
    validatePassword: PropTypes.func.isRequired,
};

export default AddUser;
