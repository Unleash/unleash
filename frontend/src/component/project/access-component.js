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
    Icon,
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

import AddUserComponent from './access-add-user';

import projectApi from '../../store/project/api';
import PageContent from '../common/PageContent';
import HeaderTitle from '../common/HeaderTitle';
import { Link, useHistory } from 'react-router-dom';

function AccessComponent({ projectId, project }) {
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState();
    const history = useHistory();

    const fetchAccess = async () => {
        const access = await projectApi.fetchAccess(projectId);
        setRoles(access.roles);
        setUsers(
            access.users.map(u => ({ ...u, name: u.name || '(No name)' }))
        );
    };

    useEffect(() => {
        fetchAccess();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    if (!project) {
        return <p>....</p>;
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
            headerContent={
                <HeaderTitle
                    title={`Manage Access for project "${project.name}"`}
                    actions={
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => history.goBack()}
                        >
                            Back
                        </Button>
                    }
                />
            }
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
                                    <Icon>delete</Icon>
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
