/* eslint-disable react/jsx-no-target-blank */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    InputLabel,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Select,
    FormControl,
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

import AddUserComponent from './access-add-user';

import projectApi from '../../store/project/api';
import PageContent from '../common/PageContent';
import useUiConfig from '../../hooks/api/getters/useUiConfig/useUiConfig';


function AccessComponent({ projectId, project }) {
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState();
    const { isOss } = useUiConfig();

    useEffect(() => {
        fetchAccess();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    

    const fetchAccess = async () => {
        try {
            const access = await projectApi.fetchAccess(projectId);
            setRoles(access.roles);
            setUsers(
                access.users.map(u => ({ ...u, name: u.name || '(No name)' }))
            );
        } catch (e) {
            console.log(e);
        }
    };

    if (isOss()) {
        return (
        <PageContent>
            <Alert severity="error">
                Controlling access to projects requires a paid version of Unleash. 
                Check out <a href="https://www.getunleash.io" target="_blank">getunleash.io</a> to find out more.
            </Alert>
        </PageContent>);
    }

    const handleRoleChange = (userId, currRoleId) => async evt => {
        const roleId = evt.target.value;
        try {
            await projectApi.removeUserFromRole(projectId, currRoleId, userId);
            await projectApi.addUserToRole(projectId, roleId, userId);
            const newUsers = users.map(u => {
                if (u.id === userId) {
                    return { ...u, roleId };
                } else return u;
            });
            setUsers(newUsers);
        } catch (err) {
            setError(err.message || 'Server problems when adding users.');
        }
    };

    const addUser = async (userId, roleId) => {
        try {
            await projectApi.addUserToRole(projectId, roleId, userId);
            await fetchAccess();
        } catch (err) {
            setError(err.message || 'Server problems when adding users.');
        }
    };

    const removeAccess = (userId, roleId) => async () => {
        try {
            await projectApi.removeUserFromRole(projectId, roleId, userId);
            const newUsers = users.filter(u => u.id !== userId);
            setUsers(newUsers);
        } catch (err) {
            setError(err.message || 'Server problems when adding users.');
        }
    };

    const handleCloseError = () => {
        setError(undefined);
    };

    return (
        <PageContent
            style={{ minHeight: '400px' }}
        >
            <AddUserComponent roles={roles} addUserToRole={addUser} />
            <Dialog
                open={!!error}
                onClose={handleCloseError}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Error'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {error}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseError}
                        color="secondary"
                        autoFocus
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <div
                style={{
                    height: '1px',
                    width: '106.65%',
                    marginLeft: '-2rem',
                    backgroundColor: '#efefef',
                    marginTop: '2rem',
                }}
            ></div>
            <List>
                {users.map(user => {
                    const labelId = `checkbox-list-secondary-label-${user.id}`;
                    return (
                        <ListItem key={user.id} button>
                            <ListItemAvatar>
                                <Avatar alt={user.name} src={user.imageUrl} />
                            </ListItemAvatar>
                            <ListItemText
                                id={labelId}
                                primary={user.name}
                                secondary={user.email || user.username}
                            />
                            <ListItemSecondaryAction
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <FormControl variant="outlined" size="small">
                                    <InputLabel
                                        style={{ backgroundColor: '#fff' }}
                                        for="add-user-select-role-label"
                                    >
                                        Role
                                    </InputLabel>
                                    <Select
                                        labelId={`role-${user.id}-select-label`}
                                        id={`role-${user.id}-select`}
                                        key={user.id}
                                        placeholder="Choose role"
                                        value={user.roleId || ''}
                                        onChange={handleRoleChange(
                                            user.id,
                                            user.roleId
                                        )}
                                    >
                                        <MenuItem value="" disabled>
                                            Choose role
                                        </MenuItem>
                                        {roles.map(role => (
                                            <MenuItem
                                                key={`${user.id}:${role.id}`}
                                                value={role.id}
                                            >
                                                {role.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <IconButton
                                    style={{ marginLeft: '0.5rem' }}
                                    edge="end"
                                    aria-label="delete"
                                    title="Remove access"
                                    onClick={removeAccess(user.id, user.roleId)}
                                >
                                    <Delete />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    );
                })}
            </List>
        </PageContent>
    );
}

AccessComponent.propTypes = {
    projectId: PropTypes.string.isRequired,
    project: PropTypes.object,
};

export default AccessComponent;
