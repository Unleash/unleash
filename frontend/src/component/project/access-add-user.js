import React, { useEffect, useState } from 'react';
import projectApi from '../../store/project/api';
import PropTypes from 'prop-types';
import {
    TextField,
    CircularProgress,
    Grid,
    Button,
    InputAdornment,
} from '@material-ui/core';
import { Search } from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Alert } from '@material-ui/lab';
import ProjectRoleSelect from './ProjectAccess/ProjectRoleSelect/ProjectRoleSelect';

function AddUserComponent({ roles, addUserToRole }) {
    const [user, setUser] = useState();
    const [role, setRole] = useState({});
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [select, setSelect] = useState(false);

    useEffect(() => {
        if (roles.length > 0) {
            const regularRole = roles.find(
                r => r.name.toLowerCase() === 'regular'
            );
            setRole(regularRole || roles[0]);
        }
    }, [roles]);

    const search = async q => {
        if (q.length > 1) {
            setLoading(true);
            // TODO: Do not hard-code fetch here.
            const users = await projectApi.searchProjectUser(q);
            setOptions([...users]);
        } else {
            setOptions([]);
        }
        setLoading(false);
    };

    const handleQueryUpdate = evt => {
        const q = evt.target.value;
        search(q);
        if (options.length === 1) {
            setSelect(true);
            return;
        }
        setSelect(false);
    };

    const handleSelectUser = (evt, value) => {
        setOptions([]);
        setUser(value);
    };

    const handleRoleChange = evt => {
        const roleId = +evt.target.value;
        const role = roles.find(r => r.id === roleId);
        setRole(role);
    };

    const handleSubmit = async evt => {
        evt.preventDefault();
        await addUserToRole(user.id, role.id);
        setUser(undefined);
        setOptions([]);
    };

    return (
        <>
            <Alert severity="info" style={{ marginBottom: '20px' }}>
                The user must have an Unleash root role before added to the
                project.
            </Alert>
            <Grid container spacing={3} alignItems="flex-end">
                <Grid item>
                    <Autocomplete
                        id="add-user-component"
                        style={{ width: 300 }}
                        noOptionsText="No users found."
                        onChange={handleSelectUser}
                        autoSelect={select}
                        value={user || ''}
                        freeSolo
                        getOptionSelected={() => true}
                        filterOptions={o => o}
                        getOptionLabel={option => {
                            if (option) {
                                return `${option.name || '(Empty name)'} <${
                                    option.email || option.username
                                }>`;
                            } else return '';
                        }}
                        options={options}
                        loading={loading}
                        renderInput={params => (
                            <TextField
                                {...params}
                                label="User"
                                variant="outlined"
                                size="small"
                                name="search"
                                onChange={handleQueryUpdate}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <React.Fragment>
                                            {loading ? (
                                                <CircularProgress
                                                    color="inherit"
                                                    size={20}
                                                />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                    />
                </Grid>
                <Grid item>
                    <ProjectRoleSelect
                        labelId="add-user-select-role-label"
                        id="add-user-select-role"
                        placeholder="Project role"
                        value={role.id || ''}
                        onChange={handleRoleChange}
                        roles={roles}
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!user}
                        onClick={handleSubmit}
                    >
                        Add user
                    </Button>
                </Grid>
            </Grid>
        </>
    );
}

AddUserComponent.propTypes = {
    roles: PropTypes.array.isRequired,
    addUserToRole: PropTypes.func.isRequired,
};

export default AddUserComponent;
