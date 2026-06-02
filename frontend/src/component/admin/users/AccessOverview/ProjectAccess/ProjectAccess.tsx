import { Badge } from 'component/common/Badge/Badge';
import { AccessOverviewAccordion } from '../AccessOverviewAccordion/AccessOverviewAccordion.tsx';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import { useMemo } from 'react';
import { useUserAccessOverview } from 'hooks/api/getters/useUserAccessOverview/useUserAccessOverview';
import { createProjectPermissionsStructure } from 'component/admin/roles/RoleForm/RolePermissionCategories/createProjectPermissionsStructure';
import type { IAccessOverviewPermissionCategory } from '../AccessOverviewAccordion/AccessOverviewList.tsx';
import { EnvironmentAccessTable } from './EnvironmentAccessTable.tsx';
import { styled } from '@mui/material';

export const filterCategory = (
    category: IAccessOverviewPermissionCategory,
    search: string,
): IAccessOverviewPermissionCategory | undefined => {
    const searchLower = search.toLowerCase();
    const filteredPermissions = category.permissions.filter(({ displayName }) =>
        displayName.toLowerCase().includes(searchLower),
    );

    if (filteredPermissions.length) {
        return { ...category, permissions: filteredPermissions };
    }
};

const StyledTopicOutlined = styled(TopicOutlinedIcon)(({ theme }) => ({
    flexShrink: 0,
    color: theme.palette.primary.main,
}));

export const ProjectAccess = ({
    id,
    project,
    projectName,
    environments,
    searchValue,
}: {
    id: string;
    project: string;
    projectName: string;
    environments: string[];
    searchValue: string;
}) => {
    const { overview, projectRoles, rootRole } = useUserAccessOverview(
        id,
        project,
    );

    const projectCategories = useMemo(() => {
        const categories = createProjectPermissionsStructure(
            overview?.project ?? [],
        ).map(({ label, permissions }) => ({
            label,
            permissions: permissions.map(([permission]) => permission),
        })) as IAccessOverviewPermissionCategory[];

        return categories
            .map((category) => filterCategory(category, searchValue))
            .filter(Boolean) as IAccessOverviewPermissionCategory[];
    }, [overview?.project, searchValue]);

    const roleIds = projectRoles?.map((rp) => rp.id);

    const envContent =
        environments.length > 0 ? (
            <EnvironmentAccessTable
                id={id}
                project={project}
                environments={environments}
                searchValue={searchValue}
            />
        ) : undefined;

    return (
        <AccessOverviewAccordion
            title={
                <>
                    <StyledTopicOutlined fontSize='small' />
                    <span>{projectName}</span>
                    {projectRoles?.map((role) => {
                        const isCustom = ![
                            'Reader',
                            'Member',
                            'Owner',
                        ].includes(role.name);
                        return (
                            <Badge
                                key={role.id}
                                color={isCustom ? 'success' : 'secondary'}
                            >
                                {role.name}
                            </Badge>
                        );
                    })}
                </>
            }
            rootRole={rootRole}
            groups={overview?.groups}
            roles={roleIds}
            categories={projectCategories}
        >
            {envContent}
        </AccessOverviewAccordion>
    );
};
