import React, { ChangeEvent, useEffect, useState } from 'react';
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
import { ProjectRoleSelect } from '../ProjectRoleSelect/ProjectRoleSelect';
import useProjectApi from '../../../../hooks/api/actions/useProjectApi/useProjectApi';
import { useParams } from 'react-router-dom';
import useToast from '../../../../hooks/useToast';
import useProjectAccess, {
    IProjectAccessUser,
} from '../../../../hooks/api/getters/useProjectAccess/useProjectAccess';
import { IProjectRole } from '../../../../interfaces/role';
import ConditionallyRender from '../../../common/ConditionallyRender';

interface IProjectAccessAddUserProps {
    roles: IProjectRole[];
}

export const ProjectAccessAddUser = ({ roles }: IProjectAccessAddUserProps) => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<IProjectAccessUser | undefined>();
    const [role, setRole] = useState<IProjectRole | undefined>();
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setToastData } = useToast();
    const { refetchProjectAccess, access } = useProjectAccess(id);

    const { searchProjectUser, addUserToRole } = useProjectApi();

    useEffect(() => {
        if (roles.length > 0) {
            const regularRole = roles.find(
                r => r.name.toLowerCase() === 'regular'
            );
            setRole(regularRole || roles[0]);
        }
    }, [roles]);

    const search = async (query: string) => {
        if (query.length > 1) {
            setLoading(true);

            const result = await searchProjectUser(query);
            const userSearchResults = await result.json();

            const filteredUsers = userSearchResults.filter(
                (selectedUser: IProjectAccessUser) => {
                    const selected = access.users.find(
                        (user: IProjectAccessUser) =>
                            user.id === selectedUser.id
                    );
                    return !selected;
                }
            );
            setOptions(filteredUsers);
        } else {
            setOptions([]);
        }
        setLoading(false);
    };

    const handleQueryUpdate = (evt: { target: { value: string } }) => {
        const q = evt.target.value;
        search(q);
    };

    const handleBlur = () => {
        if (options.length > 0) {
            const user = options[0];
            setUser(user);
        }
    };

    const handleSelectUser = (
        evt: ChangeEvent<{}>,
        selectedUser: string | IProjectAccessUser | null
    ) => {
        setOptions([]);

        if (typeof selectedUser === 'string' || selectedUser === null) {
            return;
        }

        if (selectedUser?.id) {
            setUser(selectedUser);
        }
    };

    const handleRoleChange = (
        evt: React.ChangeEvent<{
            name?: string | undefined;
            value: unknown;
        }>
    ) => {
        const roleId = Number(evt.target.value);
        const role = roles.find(role => role.id === roleId);
        if (role) {
            setRole(role);
        }
    };

    const handleSubmit = async (evt: React.SyntheticEvent) => {
        evt.preventDefault();
        if (!role || !user) {
            setToastData({
                type: 'error',
                title: 'Invalid selection',
                text: `The selected user or role does not exist`,
            });
            return;
        }

        try {
            await addUserToRole(id, role.id, user.id);
            refetchProjectAccess();
            setUser(undefined);
            setOptions([]);
            setToastData({
                type: 'success',
                title: 'Added user to project',
                text: `User added to the project with the role of ${role.name}`,
            });
        } catch (e: any) {
            let error;

            if (
                e
                    .toString()
                    .includes(`User already has access to project=${id}`)
            ) {
                error = `User already has access to project ${id}`;
            } else {
                error = e.toString() || 'Server problems when adding users.';
            }
            setToastData({
                type: 'error',
                title: error,
            });
        }
    };

    const getOptionLabel = (option: IProjectAccessUser) => {
        if (option) {
            return `${option.name || '(Empty name)'} <${
                option.email || option.username
            }>`;
        } else return '';
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
                        onBlur={() => handleBlur()}
                        value={user || ''}
                        freeSolo
                        getOptionSelected={() => true}
                        filterOptions={o => o}
                        getOptionLabel={getOptionLabel}
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
                                        <>
                                            <ConditionallyRender
                                                condition={loading}
                                                show={
                                                    <CircularProgress
                                                        color="inherit"
                                                        size={20}
                                                    />
                                                }
                                            />

                                            {params.InputProps.endAdornment}
                                        </>
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
                        value={role?.id || -1}
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
};
