import React from 'react';
import PropTypes from 'prop-types';
import {
    TextField,
    DialogTitle,
    DialogContent,
    RadioGroup,
    Radio,
    FormControl,
    FormLabel,
    FormControlLabel,
} from '@material-ui/core';
import commonStyles from '../../../component/common/common.module.scss';
import { trim } from '../../../component/common/util';

function UserForm({ title, submit, data, error, setData, roles }) {
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

    const updateNumberField = e => {
        setData({
            ...data,
            [e.target.name]: +e.target.value,
        });
    };

    return (
        <form onSubmit={submit}>
            <DialogTitle>{title}</DialogTitle>

            <DialogContent className={commonStyles.contentSpacing} style={{ display: 'flex', flexDirection: 'column' }}>
                <p style={{ color: 'red' }}>{error.general}</p>
                <TextField
                    label="Full name"
                    name="name"
                    value={data.name || ''}
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
                    required
                    value={data.email || ''}
                    error={error.email !== undefined}
                    helperText={error.email}
                    variant="outlined"
                    size="small"
                    type="email"
                    onChange={updateFieldWithTrim}
                />
                <br />
                <br />
                <FormControl>
                    <FormLabel component="legend">Role</FormLabel>
                    <RadioGroup name="rootRole" value={data.rootRole || ''} onChange={updateNumberField}>
                        {roles.map(role => (
                            <FormControlLabel
                                key={`role-${role.id}`}
                                labelPlacement="end"
                                style={{ margin: '3px 0', border: '1px solid #EFEFEF' }}
                                label={
                                    <div>
                                        <strong>{role.name}</strong>
                                        <p>{role.description}</p>
                                    </div>
                                }
                                control={<Radio />}
                                value={role.id}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </DialogContent>
        </form>
    );
}

UserForm.propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    error: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    setData: PropTypes.func.isRequired,
    roles: PropTypes.array.isRequired,
};

export default UserForm;
