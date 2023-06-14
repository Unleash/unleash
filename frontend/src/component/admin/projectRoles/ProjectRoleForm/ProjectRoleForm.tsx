import React, { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import {
    Topic as TopicIcon,
    CloudCircle as CloudCircleIcon,
} from '@mui/icons-material';
import { Box, Button, TextField, Typography } from '@mui/material';
import Input from 'component/common/Input/Input';
import { PermissionAccordion } from './PermissionAccordion/PermissionAccordion';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    IPermission,
    IProjectEnvironmentPermissions,
    IPermissions,
} from 'interfaces/permissions';
import { ICheckedPermission } from '../hooks/useProjectRoleForm';

interface IProjectRoleForm {
    roleName: string;
    roleDesc: string;
    checkedPermissions: ICheckedPermission;
    errors: { [key: string]: string };
    children: ReactNode;
    permissions:
        | IPermissions
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
    const { project, environments } = permissions;

    return (
        <form onSubmit={onSubmit}>
            <Box sx={{ maxWidth: '400px' }}>
                <Typography sx={{ mb: 1 }}>What is your role name?</Typography>
                <Input
                    label="Role name"
                    value={roleName}
                    onChange={e => setRoleName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors()}
                    onBlur={validateNameUniqueness}
                    autoFocus
                    sx={{ width: '100%', marginBottom: '1rem' }}
                />

                <Typography sx={{ mb: 1 }}>What is this role for?</Typography>
                <TextField
                    label="Role description"
                    variant="outlined"
                    multiline
                    maxRows={4}
                    value={roleDesc}
                    onChange={e => setRoleDesc(e.target.value)}
                    sx={{ width: '100%', marginBottom: '1rem' }}
                />
            </Box>
            <div>
                <ConditionallyRender
                    condition={Boolean(errors.permissions)}
                    show={
                        <Typography variant="body2" color="error.main">
                            You must select at least one permission for a role.
                        </Typography>
                    }
                />
            </div>
            <PermissionAccordion
                isInitiallyExpanded
                title="Project permissions"
                Icon={<TopicIcon color="disabled" sx={{ mr: 1 }} />}
                permissions={project}
                checkedPermissions={checkedPermissions}
                onPermissionChange={(permission: IPermission) =>
                    handlePermissionChange(permission)
                }
                onCheckAll={checkAllProjectPermissions}
                getRoleKey={getRoleKey}
                context="project"
            />
            <div>
                {environments.map(environment => (
                    <PermissionAccordion
                        title={environment.name}
                        Icon={
                            <CloudCircleIcon sx={{ mr: 1 }} color="disabled" />
                        }
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
                        context="environment"
                    />
                ))}
            </div>
            <Box
                sx={{
                    marginTop: 'auto',
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                {children}
                <Button onClick={onCancel} sx={{ marginLeft: 2 }}>
                    Cancel
                </Button>
            </Box>
        </form>
    );
};

export default ProjectRoleForm;
