import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material';
import React from 'react';
import { IProjectRole } from 'interfaces/role';

import { useStyles } from '../ProjectAccess.styles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IProjectRoleSelect {
    roles: IProjectRole[];
    labelId?: string;
    id: string;
    placeholder?: string;
    onChange: (evt: SelectChangeEvent) => void;
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
    const { classes: styles } = useStyles();
    return (
        <FormControl variant="outlined" size="small">
            <ConditionallyRender
                condition={Boolean(labelId)}
                show={() => (
                    <InputLabel
                        style={{ backgroundColor: '#fff' }}
                        id={labelId}
                    >
                        Role
                    </InputLabel>
                )}
            />

            <Select
                labelId={labelId}
                id={id}
                classes={{ select: styles.projectRoleSelect }}
                placeholder={placeholder}
                value={value || ''}
                onChange={onChange}
                renderValue={roleId => {
                    const role = roles?.find(role => {
                        return String(role.id) === String(roleId);
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
