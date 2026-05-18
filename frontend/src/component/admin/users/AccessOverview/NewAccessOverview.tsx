import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUserInfo from 'hooks/api/getters/useUserInfo/useUserInfo';
import {
    Box,
    Checkbox,
    ListItemText,
    MenuItem,
    Select,
    Typography,
    styled,
    useMediaQuery,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import theme from 'themes/theme';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useUserAccessOverview } from 'hooks/api/getters/useUserAccessOverview/useUserAccessOverview';
import { NewAccessOverviewAccordion } from './AccessOverviewAccordion/NewAccessOverviewAccordion.tsx';
import { NewAccessOverviewList } from './AccessOverviewAccordion/NewAccessOverviewList.tsx';
import {
    getCategorizedProjectPermissions,
    getCategorizedRootPermissions,
} from 'utils/permissions';
import type { IAccessOverviewPermissionCategory } from './AccessOverviewAccordion/AccessOverviewList.tsx';
import { createProjectPermissionsStructure } from 'component/admin/roles/RoleForm/RolePermissionCategories/createProjectPermissionsStructure';
import { Search } from 'component/common/Search/Search';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { RootAccessOverviewAccordion } from './AccessOverviewAccordion/RootAccessOverviewAccordion.tsx';
import { RootRoleGroupAccess } from './RootRoleGroupAccess.tsx';
import type { ProjectSchema } from 'openapi';
import type { IEnvironment } from 'interfaces/environments';

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

const StyledSelectorCardsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
    },
}));

const StyledSelectorCard = styled('div')(({ theme }) => ({
    flex: 1,
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const StyledSelectorCardText = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    flex: 1,
});

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

const StyledEnvAccessHeader = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
    fontWeight: 'bold',
    fontSize: theme.typography.body2.fontSize,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledEnvNameHeader = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5, 2, 1.5, 4),
    fontWeight: 'bold',
    fontSize: theme.typography.body2.fontSize,
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
}));

const EnvironmentSection = ({
    id,
    project,
    environment,
    roleIds,
    searchValue,
}: {
    id: string;
    project: string;
    environment: string;
    roleIds?: number[];
    searchValue: string;
}) => {
    const { overview } = useUserAccessOverview(id, project, environment);

    const environmentCategories = useMemo(() => {
        const categories = getCategorizedProjectPermissions(
            overview?.environment ?? [],
        ) as IAccessOverviewPermissionCategory[];

        return categories
            .map((category) => filterCategory(category, searchValue))
            .filter(Boolean) as IAccessOverviewPermissionCategory[];
    }, [overview?.environment, searchValue]);

    if (!environmentCategories.length) return null;

    return (
        <>
            <StyledEnvNameHeader>{environment}</StyledEnvNameHeader>
            <NewAccessOverviewList
                categories={environmentCategories}
                roles={roleIds}
                noScroll
            />
        </>
    );
};

const ProjectAccess = ({
    id,
    project,
    environments,
    searchValue,
}: {
    id: string;
    project: string;
    environments: string[];
    searchValue: string;
}) => {
    const { overview, projectRoles } = useUserAccessOverview(id, project);

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
    const roleNames = projectRoles?.map((r: any) => r.name).join(', ');

    const envContent =
        environments.length > 0 ? (
            <>
                <StyledEnvAccessHeader>
                    Environment access
                </StyledEnvAccessHeader>
                {environments.map((environment) => (
                    <EnvironmentSection
                        key={environment}
                        id={id}
                        project={project}
                        environment={environment}
                        roleIds={roleIds}
                        searchValue={searchValue}
                    />
                ))}
            </>
        ) : undefined;

    return (
        <NewAccessOverviewAccordion
            title={
                <>
                    {project}
                    {roleNames ? ` · ${roleNames}` : ''}
                </>
            }
            roles={roleIds}
            categories={projectCategories}
        >
            {envContent}
        </NewAccessOverviewAccordion>
    );
};

const ProjectAccessSection = ({
    id,
    projects,
    environments,
    searchValue,
}: {
    id: string;
    projects: ProjectSchema[];
    environments: IEnvironment[];
    searchValue: string;
}) => {
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
        [],
    );

    const visibleProjects = projects.filter((p) =>
        selectedProjectIds.includes(p.id),
    );

    const projectSelectorLabel =
        selectedProjectIds.length === 0
            ? 'Select projects'
            : selectedProjectIds.length === 1
              ? (projects.find((p) => p.id === selectedProjectIds[0])?.name ??
                '1 selected')
              : `${selectedProjectIds.length} selected`;

    const environmentSelectorLabel =
        selectedEnvironments.length === 0
            ? 'All environments'
            : selectedEnvironments.length === 1
              ? selectedEnvironments[0]
              : `${selectedEnvironments.length} selected`;

    return (
        <Box>
            <Typography variant='body1' fontWeight='bold'>
                Project access ({projects.length})
            </Typography>
            <StyledSelectorCardsContainer>
                <StyledSelectorCard>
                    <StyledSelectorCardText>
                        <Typography variant='body2' fontWeight='bold'>
                            Select projects to see permissions
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            Choose the project you want to look closer at
                        </Typography>
                    </StyledSelectorCardText>
                    <Select
                        multiple
                        value={selectedProjectIds}
                        onChange={(e) =>
                            setSelectedProjectIds(e.target.value as string[])
                        }
                        renderValue={() => projectSelectorLabel}
                        size='small'
                        sx={{ minWidth: 150, flexShrink: 0 }}
                        displayEmpty
                    >
                        {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>
                                <Checkbox
                                    checked={selectedProjectIds.includes(
                                        project.id,
                                    )}
                                    size='small'
                                />
                                <ListItemText primary={project.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </StyledSelectorCard>
                <StyledSelectorCard>
                    <StyledSelectorCardText>
                        <Typography variant='body2' fontWeight='bold'>
                            Select environments to see what is allowed
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            {environments.length} environment
                            {environments.length !== 1 ? 's' : ''} available
                        </Typography>
                    </StyledSelectorCardText>
                    <Select
                        multiple
                        value={selectedEnvironments}
                        onChange={(e) =>
                            setSelectedEnvironments(e.target.value as string[])
                        }
                        renderValue={() => environmentSelectorLabel}
                        size='small'
                        sx={{ minWidth: 150, flexShrink: 0 }}
                        displayEmpty
                    >
                        {environments.map((env) => (
                            <MenuItem key={env.name} value={env.name}>
                                <Checkbox
                                    checked={selectedEnvironments.includes(
                                        env.name,
                                    )}
                                    size='small'
                                />
                                <ListItemText primary={env.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </StyledSelectorCard>
            </StyledSelectorCardsContainer>
            {visibleProjects.map((project) => (
                <ProjectAccess
                    key={project.id}
                    project={project.id}
                    id={id}
                    searchValue={searchValue}
                    environments={selectedEnvironments}
                />
            ))}
        </Box>
    );
};

export const NewAccessOverview = () => {
    const id = useRequiredPathParam('id');
    const { projects } = useProjects();
    const { environments } = useEnvironments();
    const { user, loading } = useUserInfo(id);

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [searchValue, setSearchValue] = useState('');

    const { overview, rootRole } = useUserAccessOverview(id);

    const rootRoleGroups = overview?.groups.filter((r) => r.rootRole);

    const AccessActions = (
        <StyledActionsContainer>
            <Search initialValue={searchValue} onChange={setSearchValue} />
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
                    <RootAccessOverviewAccordion
                        rootRole={rootRole}
                        groups={rootRoleGroups}
                        categories={rootCategories}
                    />
                    <RootRoleGroupAccess groups={rootRoleGroups ?? []} />
                    <ProjectAccessSection
                        id={id}
                        projects={projects}
                        environments={environments}
                        searchValue={searchValue}
                    />
                </SearchHighlightProvider>
            </StyledAccessOverviewContainer>
        </PageContent>
    );
};
