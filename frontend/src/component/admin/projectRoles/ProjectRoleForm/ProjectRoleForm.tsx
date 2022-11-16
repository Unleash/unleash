import React, { ReactNode } from 'react';
import { Topic as TopicIcon } from '@mui/icons-material';
import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import Input from 'component/common/Input/Input';
import EnvironmentPermissionAccordion from './EnvironmentPermissionAccordion/EnvironmentPermissionAccordion';
import useProjectRolePermissions from 'hooks/api/getters/useProjectRolePermissions/useProjectRolePermissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IPermission } from 'interfaces/project';
import {
    ICheckedPermission,
    PROJECT_CHECK_ALL_KEY,
} from '../hooks/useProjectRoleForm';
import { useStyles } from './ProjectRoleForm.styles';

interface IProjectRoleForm {
    roleName: string;
    roleDesc: string;
    setRoleName: React.Dispatch<React.SetStateAction<string>>;
    setRoleDesc: React.Dispatch<React.SetStateAction<string>>;
    checkedPermissions: ICheckedPermission;
    handlePermissionChange: (permission: IPermission, type: string) => void;
    checkAllProjectPermissions: () => void;
    checkAllEnvironmentPermissions: (envName: string) => void;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode?: string;
    clearErrors: () => void;
    validateNameUniqueness?: () => void;
    getRoleKey: (permission: { id: number; environment?: string }) => string;
    children: ReactNode;
}

const ProjectRoleForm: React.FC<IProjectRoleForm> = ({
    children,
    handleSubmit,
    handleCancel,
    roleName,
    roleDesc,
    setRoleName,
    setRoleDesc,
    checkedPermissions,
    handlePermissionChange,
    checkAllProjectPermissions,
    checkAllEnvironmentPermissions,
    errors,
    mode,
    validateNameUniqueness,
    clearErrors,
    getRoleKey,
}: IProjectRoleForm) => {
    const { classes: styles } = useStyles();
    const { permissions } = useProjectRolePermissions({
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnFocus: false,
    });

    const { project, environments } = permissions;

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.container}>
                <p className={styles.inputDescription}>
                    What is your role name?
                </p>
                <Input
                    className={styles.input}
                    label="Role name"
                    value={roleName}
                    onChange={e => setRoleName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors()}
                    onBlur={validateNameUniqueness}
                    autoFocus
                />

                <p className={styles.inputDescription}>
                    What is this role for?
                </p>
                <TextField
                    className={styles.input}
                    label="Role description"
                    variant="outlined"
                    multiline
                    maxRows={4}
                    value={roleDesc}
                    onChange={e => setRoleDesc(e.target.value)}
                />
            </div>
            <div className={styles.permissionErrorContainer}>
                <ConditionallyRender
                    condition={Boolean(errors.permissions)}
                    show={
                        <span className={styles.errorMessage}>
                            You must select at least one permission for a role.
                        </span>
                    }
                />
            </div>
            <h3 className={styles.header}>
                <TopicIcon /> Project permissions
                {/* FIXME: refactor */}
            </h3>
            <div>
                {project.map(permission => (
                    <FormControlLabel
                        key={getRoleKey(permission)}
                        classes={{ root: styles.label }}
                        control={
                            <Checkbox
                                checked={
                                    checkedPermissions[getRoleKey(permission)]
                                        ? true
                                        : false
                                }
                                onChange={() =>
                                    handlePermissionChange(
                                        permission,
                                        'project'
                                    )
                                }
                                color="primary"
                            />
                        }
                        label={permission.displayName}
                    />
                ))}
                <FormControlLabel
                    key={PROJECT_CHECK_ALL_KEY}
                    classes={{ root: styles.label }}
                    control={
                        <Checkbox
                            checked={
                                checkedPermissions[PROJECT_CHECK_ALL_KEY]
                                    ? true
                                    : false
                            }
                            onChange={() => checkAllProjectPermissions()}
                            color="primary"
                        />
                    }
                    label={
                        <>
                            <strong>Select all</strong> project permissions
                        </>
                    }
                />
            </div>
            <h3 className={styles.header}>
                Environment permissions
                {/* FIXME: remove */}
            </h3>
            <div>
                {environments.map(environment => (
                    <EnvironmentPermissionAccordion
                        title={environment.name}
                        permissions={environment.permissions}
                        key={environment.name}
                        checkedPermissions={checkedPermissions}
                        onPermissionChange={(permission: IPermission) =>
                            handlePermissionChange(permission, environment.name)
                        }
                        onCheckAll={() =>
                            checkAllEnvironmentPermissions(environment.name)
                        }
                        getRoleKey={getRoleKey}
                    />
                ))}
            </div>
            <div className={styles.buttonContainer}>
                {children}
                <Button onClick={handleCancel} className={styles.cancelButton}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default ProjectRoleForm;
