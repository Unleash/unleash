import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUserInfo from 'hooks/api/getters/useUserInfo/useUserInfo';
import { styled, useMediaQuery } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import theme from 'themes/theme';
import { StringParam, useQueryParams } from 'use-query-params';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { AccessOverviewSelect } from './AccessOverviewSelect.tsx';
import { useUserAccessOverview } from 'hooks/api/getters/useUserAccessOverview/useUserAccessOverview';
import { AccessOverviewAccordion } from './AccessOverviewAccordion/AccessOverviewAccordion.tsx';
import {
    getCategorizedProjectPermissions,
    getCategorizedRootPermissions,
} from 'utils/permissions';
import type { IAccessOverviewPermissionCategory } from './AccessOverviewAccordion/AccessOverviewList.tsx';
import { createProjectPermissionsStructure } from 'component/admin/roles/RoleForm/RolePermissionCategories/createProjectPermissionsStructure';
import { Search } from 'component/common/Search/Search';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';

const StyledActionsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flex: 1,
    gap: theme.spacing(1),
    maxWidth: 800,
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        maxWidth: '100%',
    },
    '& > div': {
        width: '100%',
    },
}));

const StyledAccessOverviewContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const filterCategory = (
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

export const AccessOverview = () => {
    const id = useRequiredPathParam('id');
    const [query, setQuery] = useQueryParams({
        project: StringParam,
        environment: StringParam,
    });
    const { projects } = useProjects();
    const { environments } = useEnvironments();
    const { user, loading } = useUserInfo(id);

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [searchValue, setSearchValue] = useState('');
    const [project, setProject] = useState(query.project ?? '');
    const [environment, setEnvironment] = useState(
        query.environment ?? undefined,
    );

    const { overview, rootRole, projectRoles } = useUserAccessOverview(
        id,
        project,
        environment,
    );

    useEffect(() => {
        setQuery(
            {
                project: project || undefined,
                environment,
            },
            'replace',
        );
    }, [project, environment]);

    const AccessActions = (
        <StyledActionsContainer>
            <Search initialValue={searchValue} onChange={setSearchValue} />
            <AccessOverviewSelect
                label='Project'
                options={projects}
                getOptionLabel={(option) => option?.name ?? ''}
                value={projects.find(({ id }) => id === project)}
                setValue={(value) => setProject(value?.id ?? '')}
            />
            <AccessOverviewSelect
                label='Environment'
                options={environments}
                getOptionLabel={(option) =>
                    option?.name.concat(
                        !option.enabled ? ' - deprecated' : '',
                    ) ?? ''
                }
                value={environments.find(({ name }) => name === environment)}
                setValue={(value) => setEnvironment(value?.name)}
            />
        </StyledActionsContainer>
    );

    const rootCategories = useMemo(() => {
        const categories = getCategorizedRootPermissions(
            overview?.root ?? [],
        ) as IAccessOverviewPermissionCategory[];

        if (!searchValue) return categories;

        return categories
            .map((category) => filterCategory(category, searchValue))
            .filter(Boolean) as IAccessOverviewPermissionCategory[];
    }, [overview?.root, searchValue]);

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

    const environmentCategories = useMemo(() => {
        const categories = getCategorizedProjectPermissions(
            overview?.environment ?? [],
        ) as IAccessOverviewPermissionCategory[];

        return categories
            .map((category) => filterCategory(category, searchValue))
            .filter(Boolean) as IAccessOverviewPermissionCategory[];
    }, [overview?.environment, searchValue]);

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Access overview for ${user.name || user.email || user.username}`}
                    actions={
                        <ConditionallyRender
                            condition={!isSmallScreen}
                            show={AccessActions}
                        />
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={AccessActions}
                    />
                </PageHeader>
            }
        >
            <StyledAccessOverviewContainer>
                <SearchHighlightProvider value={searchValue}>
                    <AccessOverviewAccordion categories={rootCategories}>
                        Root permissions for role {rootRole?.name}
                    </AccessOverviewAccordion>
                    <AccessOverviewAccordion categories={projectCategories}>
                        Project permissions
                        {project
                            ? ` for project ${project}${projectRoles?.length ? ` with project role${projectRoles.length !== 1 ? 's' : ''} ${projectRoles?.map((role: any) => role.name).join(', ')}` : ''}`
                            : ''}
                    </AccessOverviewAccordion>
                    {environment && (
                        <AccessOverviewAccordion
                            categories={environmentCategories}
                        >
                            Environment permissions for {environment}
                        </AccessOverviewAccordion>
                    )}
                </SearchHighlightProvider>
            </StyledAccessOverviewContainer>
        </PageContent>
    );
};
