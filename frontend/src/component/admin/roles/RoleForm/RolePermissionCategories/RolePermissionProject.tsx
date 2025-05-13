import { useMemo } from 'react';
import { styled, Typography } from '@mui/material';
import type { ICheckedPermissions, IPermission } from 'interfaces/permissions';
import { createProjectPermissionsStructure } from './createProjectPermissionsStructure.ts';
import { RolePermissionProjectItem } from './RolePermissionProjectItem.tsx';

interface IEnvironmentPermissionAccordionProps {
    permissions: IPermission[];
    checkedPermissions: ICheckedPermissions;
    onPermissionChange: (permission: IPermission) => void;
}

const StyledGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
    },
}));

const StyledSectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
}));

export const RolePermissionProject = ({
    permissions,
    checkedPermissions,
    onPermissionChange,
}: IEnvironmentPermissionAccordionProps) => {
    const permissionsStructure = useMemo(
        () => createProjectPermissionsStructure(permissions),
        [permissions],
    );

    return (
        <StyledGrid>
            {permissionsStructure.map((category) => (
                <div>
                    <StyledSectionTitle>{category.label}</StyledSectionTitle>
                    <div>
                        {category.permissions.map(
                            ([permission, parentPermission]) => (
                                <RolePermissionProjectItem
                                    permission={permission}
                                    onChange={() =>
                                        onPermissionChange(permission)
                                    }
                                    isChecked={Boolean(
                                        checkedPermissions[permission.name],
                                    )}
                                    hasParentPermission={Boolean(
                                        parentPermission,
                                    )}
                                    isParentPermissionChecked={Boolean(
                                        parentPermission &&
                                            checkedPermissions[
                                                parentPermission
                                            ],
                                    )}
                                />
                            ),
                        )}
                    </div>
                </div>
            ))}
        </StyledGrid>
    );
};
