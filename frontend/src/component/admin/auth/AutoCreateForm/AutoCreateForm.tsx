import { type ChangeEvent, Fragment } from 'react';
import {
    FormControl,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
} from '@mui/material';
import { RoleSelect } from 'component/common/RoleSelect/RoleSelect';
import { useRoles } from 'hooks/api/getters/useRoles/useRoles';
import type { IRole } from 'interfaces/role';

interface IAutoCreateFormProps {
    data?: {
        enabled: boolean;
        autoCreate: boolean;
        defaultRootRole?: string;
        defaultRootRoleId?: number;
        emailDomains?: string;
    };
    setValue: (
        name: string,
        value: string | boolean | number | undefined,
    ) => void;
    onUpdateRole: (role: IRole | null) => void;
    disabled?: boolean;
}

export const AutoCreateForm = ({
    data = { enabled: false, autoCreate: false },
    setValue,
    onUpdateRole,
    disabled = false,
}: IAutoCreateFormProps) => {
    const { roles } = useRoles();

    const updateAutoCreate = () => {
        setValue('autoCreate', !data.autoCreate);
    };

    const updateField = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.name, e.target.value);
    };

    const resolveRole = ({
        defaultRootRole,
        defaultRootRoleId,
    }: {
        defaultRootRole?: string;
        defaultRootRoleId?: number;
    }): IRole | null => {
        if (defaultRootRoleId) {
            return roles.find(({ id }) => id === defaultRootRoleId) || null;
        }
        return roles.find(({ name }) => name === defaultRootRole) || null;
    };

    return (
        <Fragment>
            <Grid container spacing={3} mb={2}>
                <Grid item md={5}>
                    <strong>Auto-create users</strong>
                    <p>
                        Enable automatic creation of new users when signing in.
                    </p>
                </Grid>
                <Grid item md={6} style={{ padding: '20px' }}>
                    <FormControlLabel
                        control={
                            <Switch
                                onChange={updateAutoCreate}
                                name='enabled'
                                checked={data.autoCreate}
                                disabled={!data.enabled || disabled}
                            />
                        }
                        label='Auto-create users'
                    />
                </Grid>
            </Grid>
            <Grid container spacing={3} mb={2}>
                <Grid item md={5}>
                    <strong>Default Root Role</strong>
                    <p>
                        Choose which root role the user should get when no
                        explicit role mapping exists.
                    </p>
                </Grid>
                <Grid item md={6}>
                    <FormControl style={{ width: '400px' }}>
                        <RoleSelect
                            roles={roles}
                            value={resolveRole(data)}
                            setValue={onUpdateRole}
                            disabled={
                                !data.autoCreate || !data.enabled || disabled
                            }
                            required
                            hideDescription
                        />
                    </FormControl>
                </Grid>
            </Grid>
            <Grid container spacing={3} mb={2}>
                <Grid item md={5}>
                    <strong>Email domains</strong>
                    <p>
                        Comma separated list of email domains that should be
                        allowed to sign in.
                    </p>
                </Grid>
                <Grid item md={6}>
                    <TextField
                        onChange={updateField}
                        label='Email domains'
                        name='emailDomains'
                        disabled={!data.autoCreate || !data.enabled || disabled}
                        required={Boolean(data.autoCreate)}
                        value={data.emailDomains || ''}
                        placeholder='@company.com, @anotherCompany.com'
                        style={{ width: '400px' }}
                        rows={2}
                        variant='outlined'
                        size='small'
                    />
                </Grid>
            </Grid>
        </Fragment>
    );
};
