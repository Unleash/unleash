import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import React from 'react';
import IRole from '../../../../interfaces/role';

import { useStyles } from '../ProjectAccess.styles';

interface IProjectRoleSelect {
    roles: IRole[];
    labelId: string;
    id: string;
    placeholder?: string;
    onChange: () => void;
    value: any;
}

const ProjectRoleSelect: React.FC<IProjectRoleSelect> = ({
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
                    return roles?.find(role => {
                        return role.id === roleId;
                    }).name;
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

export default ProjectRoleSelect;
