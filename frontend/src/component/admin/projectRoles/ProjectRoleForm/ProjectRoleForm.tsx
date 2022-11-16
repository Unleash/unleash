import React, { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { Topic as TopicIcon } from '@mui/icons-material';
import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import Input from 'component/common/Input/Input';
import { PermissionAccordion } from './PermissionAccordion/PermissionAccordion';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';
import {
    IPermission,
    IProjectEnvironmentPermissions,
    IProjectRolePermissions,
} from 'interfaces/project';
import { ICheckedPermission } from '../hooks/useProjectRoleForm';
import { useStyles } from './ProjectRoleForm.styles';

interface IProjectRoleForm {
    roleName: string;
    roleDesc: string;
    checkedPermissions: ICheckedPermission;
    errors: { [key: string]: string };
    children: ReactNode;
    permissions:
        | IProjectRolePermissions
        | {
              project: IPermission[];
              environments: IProjectEnvironmentPermissions[];
          };
    setRoleName: Dispatch<SetStateAction<string>>;
    setRoleDesc: Dispatch<SetStateAction<string>>;
    handlePermissionChange: (permission: IPermission) => void;
    checkAllProjectPermissions: () => void;
    checkAllEnvironmentPermissions: (envName: string) => void;
    onSubmit: (e: any) => void;
    onCancel: () => void;
    clearErrors: () => void;
    validateNameUniqueness?: () => void;
    getRoleKey: (permission: { id: number; environment?: string }) => string;
}

const ProjectRoleForm: FC<IProjectRoleForm> = ({
    children,
    roleName,
    roleDesc,
    checkedPermissions,
    errors,
    permissions,
    onSubmit,
    onCancel,
    setRoleName,
    setRoleDesc,
    handlePermissionChange,
    checkAllProjectPermissions,
    checkAllEnvironmentPermissions,
    validateNameUniqueness,
    clearErrors,
    getRoleKey,
}: IProjectRoleForm) => {
    const { classes: styles } = useStyles();

    const { project, environments } = permissions;

    return (
        <form onSubmit={onSubmit}>
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
                                    handlePermissionChange(permission)
                                }
                                color="primary"
                            />
                        }
                        label={permission.displayName}
                    />
                ))}
                <FormControlLabel
                    classes={{ root: styles.label }}
                    control={
                        <Checkbox
                            checked // FIXME: refactor
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
                    <PermissionAccordion
                        title={environment.name}
                        Icon={<EnvironmentIcon enabled={false} />}
                        permissions={environment.permissions}
                        key={environment.name}
                        checkedPermissions={checkedPermissions}
                        onPermissionChange={(permission: IPermission) =>
                            handlePermissionChange(permission)
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
                <Button onClick={onCancel} className={styles.cancelButton}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default ProjectRoleForm;
