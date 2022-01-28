import Input from '../../../common/Input/Input';
import EnvironmentPermissionAccordion from './EnvironmentPermissionAccordion/EnvironmentPermissionAccordion';
import {
    Checkbox,
    FormControlLabel,
    TextField,
    Button,
} from '@material-ui/core';
import useProjectRolePermissions from '../../../../hooks/api/getters/useProjectRolePermissions/useProjectRolePermissions';

import { useStyles } from './ProjectRoleForm.styles';
import ConditionallyRender from '../../../common/ConditionallyRender';
import React from 'react';
import { IPermission } from '../../../../interfaces/project';
import {
    ICheckedPermission,
    PROJECT_CHECK_ALL_KEY,
} from '../hooks/useProjectRoleForm';

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
    const styles = useStyles();
    const { permissions } = useProjectRolePermissions({
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnFocus: false,
    });

    const { project, environments } = permissions;

    const renderProjectPermissions = () => {
        const projectPermissions = project.map(permission => {
            return (
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
                                handlePermissionChange(permission, 'project')
                            }
                            color="primary"
                        />
                    }
                    label={permission.displayName}
                />
            );
        });

        projectPermissions.push(
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
                label={'Select all project permissions'}
            />
        );

        return projectPermissions;
    };

    const renderEnvironmentPermissions = () => {
        return environments.map(environment => {
            return (
                <EnvironmentPermissionAccordion
                    environment={environment}
                    key={environment.name}
                    checkedPermissions={checkedPermissions}
                    handlePermissionChange={handlePermissionChange}
                    checkAllEnvironmentPermissions={
                        checkAllEnvironmentPermissions
                    }
                    getRoleKey={getRoleKey}
                />
            );
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 className={styles.formHeader}>Role information</h3>

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
            <h3 className={styles.header}>Project permissions</h3>
            <div>{renderProjectPermissions()}</div>
            <h3 className={styles.header}>Environment permissions</h3>
            <div>{renderEnvironmentPermissions()}</div>
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
