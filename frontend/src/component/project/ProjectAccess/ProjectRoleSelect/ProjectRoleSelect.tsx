import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import React from 'react';
import { IProjectRole } from 'interfaces/role';

import { useStyles } from '../ProjectAccess.styles';

interface IProjectRoleSelect {
    roles: IProjectRole[];
    labelId: string;
    id: string;
    placeholder?: string;
    onChange: (
        evt: React.ChangeEvent<{
            name?: string | undefined;
            value: unknown;
        }>
    ) => void;
    value: any;
}

export const ProjectRoleSelect: React.FC<IProjectRoleSelect> = ({
    roles,
    onChange,
    labelId,
    id,
    value,
    placeholder,
    children,
}) => {
    const styles = useStyles();
    return (
        <FormControl variant="outlined" size="small">
            <InputLabel
                style={{ backgroundColor: '#fff' }}
                id="add-user-select-role-label"
            >
                Role
            </InputLabel>
            <Select
                labelId={labelId}
                id={id}
                classes={{ root: styles.projectRoleSelect }}
                placeholder={placeholder}
                value={value || ''}
                onChange={onChange}
                renderValue={roleId => {
                    const role = roles?.find(role => {
                        return role.id === roleId;
                    });
                    return role?.name || '';
                }}
            >
                {children}
                {roles?.map(role => (
                    <MenuItem
                        key={role.id}
                        value={role.id}
                        classes={{
                            root: styles.menuItem,
                        }}
                    >
                        <div>
                            <span className={styles.roleName}>{role.name}</span>
                            <p>
                                {role.description ||
                                    'No role description available.'}
                            </p>
                        </div>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
