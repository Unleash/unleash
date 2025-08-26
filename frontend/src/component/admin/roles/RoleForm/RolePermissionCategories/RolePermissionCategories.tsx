import UserIcon from '@mui/icons-material/Person';
import TopicIcon from '@mui/icons-material/Topic';
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
import {
    ENVIRONMENT_PERMISSION_TYPE,
    PROJECT_PERMISSION_TYPE,
    PROJECT_ROLE_TYPES,
} from '@server/util/constants';
import usePermissions from 'hooks/api/getters/usePermissions/usePermissions';
import type { ICheckedPermissions, IPermission } from 'interfaces/permissions';
import type { PredefinedRoleType } from 'interfaces/role';
import {
    flattenProjectPermissions,
    getCategorizedProjectPermissions,
    getCategorizedRootPermissions,
    toggleAllPermissions,
    togglePermission,
} from 'utils/permissions';
import { RolePermissionEnvironment } from './RolePermissionEnvironment.tsx';
import { useMemo } from 'react';
import { RolePermissionProject } from './RolePermissionProject.tsx';
import { RolePermissionCategoryAccordion } from './RolePermissionCategoryAccordion.tsx';

interface IPermissionCategoriesProps {
    type: PredefinedRoleType;
    checkedPermissions: ICheckedPermissions;
    setCheckedPermissions: React.Dispatch<
        React.SetStateAction<ICheckedPermissions>
    >;
    validatePermissions: (permissions: ICheckedPermissions) => boolean;
}

export const RolePermissionCategories = ({
    type,
    checkedPermissions,
    setCheckedPermissions,
    validatePermissions,
}: IPermissionCategoriesProps) => {
    const { permissions } = usePermissions({
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnFocus: false,
    });

    const isProjectRole = PROJECT_ROLE_TYPES.includes(type);

    const categories = useMemo(
        () =>
            isProjectRole
                ? getCategorizedProjectPermissions(
                      flattenProjectPermissions(
                          permissions.project,
                          permissions.environments,
                      ),
                  )
                : getCategorizedRootPermissions(permissions.root),
        [permissions, isProjectRole],
    );

    const onPermissionChange = (permission: IPermission) => {
        const newCheckedPermissions = togglePermission(
            checkedPermissions,
            permission,
        );
        validatePermissions(newCheckedPermissions);
        setCheckedPermissions(newCheckedPermissions);
    };

    const onCheckAll = (permissions: IPermission[]) => {
        const newCheckedPermissions = toggleAllPermissions(
            checkedPermissions,
            permissions,
        );
        validatePermissions(newCheckedPermissions);
        setCheckedPermissions(newCheckedPermissions);
    };

    return useMemo(
        () => (
            <>
                {categories.map(({ label, type, permissions }) => (
                    <RolePermissionCategoryAccordion
                        key={label}
                        title={label}
                        context={label.toLowerCase()}
                        Icon={
                            type === PROJECT_PERMISSION_TYPE ? (
                                <TopicIcon color='disabled' sx={{ mr: 1 }} />
                            ) : type === ENVIRONMENT_PERMISSION_TYPE ? (
                                <CloudCircleIcon
                                    color='disabled'
                                    sx={{ mr: 1 }}
                                />
                            ) : (
                                <UserIcon color='disabled' sx={{ mr: 1 }} />
                            )
                        }
                        permissions={permissions}
                        checkedPermissions={checkedPermissions}
                        onCheckAll={() => onCheckAll(permissions)}
                    >
                        {type === 'project' ? (
                            <RolePermissionProject
                                permissions={permissions}
                                checkedPermissions={checkedPermissions}
                                onPermissionChange={onPermissionChange}
                            />
                        ) : (
                            <RolePermissionEnvironment
                                permissions={permissions}
                                checkedPermissions={checkedPermissions}
                                onPermissionChange={onPermissionChange}
                            />
                        )}
                    </RolePermissionCategoryAccordion>
                ))}
            </>
        ),
        [categories, checkedPermissions],
    );
};
