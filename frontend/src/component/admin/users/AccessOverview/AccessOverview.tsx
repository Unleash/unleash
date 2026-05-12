import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUserInfo from 'hooks/api/getters/useUserInfo/useUserInfo';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Chip,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    useMediaQuery,
} from '@mui/material';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import theme from 'themes/theme';
import { StringParam, useQueryParams } from 'use-query-params';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useUserAccessOverview } from 'hooks/api/getters/useUserAccessOverview/useUserAccessOverview';
import { AccessOverviewAccordion } from './AccessOverviewAccordion/AccessOverviewAccordion.tsx';
import { getCategorizedRootPermissions } from 'utils/permissions';
import type { IAccessOverviewPermission } from 'interfaces/permissions';
import type { IAccessOverviewPermissionCategory } from './AccessOverviewAccordion/AccessOverviewList.tsx';
import { createProjectPermissionsStructure } from 'component/admin/roles/RoleForm/RolePermissionCategories/createProjectPermissionsStructure';
import { Search } from 'component/common/Search/Search';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from 'hooks/api/getters/httpErrorResponseHandler';
import type { IEnvironment } from 'interfaces/environments';
import type { IRole } from 'interfaces/role';
import type { ProjectSchema, UserAccessSchema } from 'openapi';

type UserAccessSummary = UserAccessSchema & {
    groupProjects?: string[];
};

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

const StyledMembershipPanel = styled('section')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledMembershipTitle = styled('strong')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledMembershipChips = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: theme.spacing(0.5),
}));

const StyledProjectSection = styled('section')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
}));

const StyledProjectAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    boxShadow: 'none',
    margin: 0,
    '&:before': {
        display: 'none',
    },
}));

const StyledProjectAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    '& .MuiAccordionSummary-content': {
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing(2),
    },
}));

const StyledProjectAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
}));

const StyledProjectTitle = styled('h2')(({ theme }) => ({
    margin: 0,
    fontSize: theme.fontSizes.mainHeader,
}));

const StyledProjectTitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
}));

const StyledAccessPanel = styled('section')(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
}));

const StyledMatrixHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledMatrixTitle = styled('strong')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledMatrixSummary = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledRoleChips = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
}));

const StyledMatrixStatus = styled('span', {
    shouldForwardProp: (prop) => prop !== 'hasPermission',
})<{ hasPermission: boolean }>(({ theme, hasPermission }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: theme.spacing(3),
    height: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    color: hasPermission
        ? theme.palette.success.main
        : theme.palette.text.secondary,
    backgroundColor: hasPermission
        ? theme.palette.success.light
        : theme.palette.background.elevation1,
    '& svg': {
        fontSize: theme.fontSizes.bodySize,
    },
}));

const StyledCategoryCell = styled(TableCell)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    backgroundColor: theme.palette.background.elevation1,
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

const projectQueryParam = (projects: string[]) =>
    projects.length ? projects.join(',') : undefined;

const parseProjectQueryParam = (projects?: string | null) =>
    projects?.split(',').filter(Boolean) ?? [];

const permissionFetcher = (paths: string) =>
    Promise.all(
        paths.split('|').map((path) =>
            fetch(path)
                .then(handleErrorResponses('User access matrix'))
                .then((res) => res.json()),
        ),
    );

const useEnvironmentAccessOverview = (
    userId: string,
    projectId: string,
    environments: IEnvironment[],
) => {
    const paths = projectId
        ? environments.map(({ name }) =>
              formatApiPath(
                  `api/admin/user-admin/${userId}/permissions?project=${projectId}&environment=${name}`,
              ),
          )
        : [];

    const { data, error } = useSWR(
        paths.length ? paths.join('|') : null,
        permissionFetcher,
    );

    return {
        permissionsByEnvironment:
            data?.reduce(
                (
                    result: Record<string, IAccessOverviewPermission[]>,
                    response,
                    index,
                ) => {
                    result[environments[index].name] =
                        response.overview.environment ?? [];
                    return result;
                },
                {},
            ) ?? {},
        loading: !error && !data,
    };
};

const useUserAccessSummary = (userId: string) => {
    const { data } = useSWR(
        formatApiPath('api/admin/user-admin/access'),
        (path) =>
            fetch(path)
                .then(handleErrorResponses('Access'))
                .then((res) => res.json()),
    );

    return (data?.users as UserAccessSummary[] | undefined)?.find(
        ({ userId: accessUserId }) => accessUserId === Number(userId),
    );
};

export const AccessOverview = () => {
    const id = useRequiredPathParam('id');
    const [query, setQuery] = useQueryParams({
        projects: StringParam,
    });
    const { projects } = useProjects();
    const { environments } = useEnvironments();
    const { user, loading } = useUserInfo(id);

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [searchValue, setSearchValue] = useState('');
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
        parseProjectQueryParam(query.projects),
    );

    const { overview, rootRole } = useUserAccessOverview(id);
    const accessSummary = useUserAccessSummary(id);

    useEffect(() => {
        setQuery(
            {
                projects: projectQueryParam(selectedProjectIds),
            },
            'replace',
        );
    }, [selectedProjectIds]);

    useEffect(() => {
        if (selectedProjectIds.length || !projects.length) return;

        setSelectedProjectIds(
            projects.slice(0, 3).flatMap(({ id }) => (id ? [id] : [])),
        );
    }, [projects, selectedProjectIds.length]);

    const selectedProjects = useMemo(
        () =>
            projects.filter(({ id }) => id && selectedProjectIds.includes(id)),
        [projects, selectedProjectIds],
    );

    const AccessActions = (
        <StyledActionsContainer>
            <Search initialValue={searchValue} onChange={setSearchValue} />
            <Autocomplete
                multiple
                options={projects}
                size='small'
                fullWidth
                getOptionLabel={(option) => option?.name ?? ''}
                value={selectedProjects}
                onChange={(_, value) =>
                    setSelectedProjectIds(
                        value.flatMap(({ id }) => (id ? [id] : [])),
                    )
                }
                renderInput={(params) => (
                    <TextField {...params} label='Projects' />
                )}
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
                        Instance access
                        {rootRole?.name
                            ? ` via root role ${rootRole.name}`
                            : ''}
                    </AccessOverviewAccordion>
                    <UserGroupsPanel groups={accessSummary?.groups ?? []} />
                    {selectedProjects.map((project) => (
                        <ProjectAccessSection
                            key={project.id}
                            userId={id}
                            project={project}
                            environments={environments}
                            searchValue={searchValue}
                            accessSummary={accessSummary}
                        />
                    ))}
                </SearchHighlightProvider>
            </StyledAccessOverviewContainer>
        </PageContent>
    );
};

const ProjectAccessSection = ({
    userId,
    project,
    environments,
    searchValue,
    accessSummary,
}: {
    userId: string;
    project: ProjectSchema;
    environments: IEnvironment[];
    searchValue: string;
    accessSummary?: UserAccessSummary;
}) => {
    const { overview, projectRoles } = useUserAccessOverview(
        userId,
        project.id,
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

    const projectPermissions = projectCategories.flatMap(
        ({ permissions }) => permissions,
    );

    return (
        <StyledProjectSection>
            <StyledProjectAccordion defaultExpanded>
                <StyledProjectAccordionSummary expandIcon={<ExpandMore />}>
                    <StyledProjectTitleContainer>
                        <StyledProjectTitle>{project.name}</StyledProjectTitle>
                        <RoleChips roles={projectRoles ?? []} />
                        <ProjectMembershipChips
                            projectId={project.id}
                            accessSummary={accessSummary}
                        />
                    </StyledProjectTitleContainer>
                    <StyledMatrixSummary>
                        {
                            projectPermissions.filter(
                                ({ hasPermission }) => hasPermission,
                            ).length
                        }
                        /{projectPermissions.length} project permissions
                    </StyledMatrixSummary>
                </StyledProjectAccordionSummary>
                <StyledProjectAccordionDetails>
                    <ProjectAccessTable categories={projectCategories} />
                    <EnvironmentAccessMatrix
                        userId={userId}
                        projectId={project.id ?? ''}
                        environments={environments}
                        searchValue={searchValue}
                    />
                </StyledProjectAccordionDetails>
            </StyledProjectAccordion>
        </StyledProjectSection>
    );
};

const UserGroupsPanel = ({ groups }: { groups: string[] }) => (
    <StyledMembershipPanel>
        <StyledMembershipTitle>User groups</StyledMembershipTitle>
        <StyledMembershipChips>
            {groups.length ? (
                groups.map((group) => (
                    <Chip key={group} label={group} size='small' />
                ))
            ) : (
                <StyledMatrixSummary>No groups</StyledMatrixSummary>
            )}
        </StyledMembershipChips>
    </StyledMembershipPanel>
);

const ProjectMembershipChips = ({
    projectId,
    accessSummary,
}: {
    projectId?: string;
    accessSummary?: UserAccessSummary;
}) => {
    if (!projectId || !accessSummary) return null;

    const hasDirectAccess =
        accessSummary.accessibleProjects?.includes(projectId) ?? false;
    const hasGroupAccess =
        accessSummary.groupProjects?.includes(projectId) ?? false;

    if (!hasDirectAccess && !hasGroupAccess) return null;

    return (
        <StyledRoleChips>
            {hasDirectAccess ? (
                <Chip label='Direct access' size='small' />
            ) : null}
            {hasGroupAccess ? <Chip label='Via group' size='small' /> : null}
        </StyledRoleChips>
    );
};

const RoleChips = ({ roles }: { roles: IRole[] }) => {
    if (!roles.length) return null;

    return (
        <StyledRoleChips>
            {roles.map((role) => (
                <Chip key={role.id} label={role.name} size='small' />
            ))}
        </StyledRoleChips>
    );
};

const ProjectAccessTable = ({
    categories,
}: {
    categories: IAccessOverviewPermissionCategory[];
}) => {
    const permissions = categories.flatMap(({ permissions }) => permissions);
    const grantedPermissionCount = permissions.filter(
        ({ hasPermission }) => hasPermission,
    ).length;

    return (
        <StyledAccessPanel>
            <StyledMatrixHeader>
                <StyledMatrixTitle>Project access</StyledMatrixTitle>
                <StyledMatrixSummary>
                    {grantedPermissionCount}/{permissions.length} project
                    permissions
                </StyledMatrixSummary>
            </StyledMatrixHeader>
            <TableContainer sx={{ maxHeight: 520, overflow: 'auto' }}>
                <Table size='small' stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Permission</TableCell>
                            <TableCell align='center'>Access</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => (
                            <Fragment key={category.label}>
                                <TableRow key={category.label}>
                                    <StyledCategoryCell colSpan={2}>
                                        {category.label}
                                    </StyledCategoryCell>
                                </TableRow>
                                {category.permissions.map((permission) => (
                                    <TableRow key={permission.name}>
                                        <TableCell>
                                            {permission.displayName}
                                        </TableCell>
                                        <TableCell align='center'>
                                            <PermissionMatrixStatus
                                                hasPermission={
                                                    permission.hasPermission
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </StyledAccessPanel>
    );
};

const EnvironmentAccessMatrix = ({
    userId,
    projectId,
    environments,
    searchValue,
}: {
    userId: string;
    projectId: string;
    environments: IEnvironment[];
    searchValue: string;
}) => {
    const { permissionsByEnvironment } = useEnvironmentAccessOverview(
        userId,
        projectId,
        environments,
    );

    const permissions = useMemo(() => {
        const permissions = Object.values(permissionsByEnvironment).flat();
        return Array.from(
            new Map(
                permissions.map((permission) => [permission.name, permission]),
            ).values(),
        ).sort((a, b) => a.displayName.localeCompare(b.displayName));
    }, [permissionsByEnvironment]);

    const filteredPermissions = useMemo(
        () =>
            permissions.filter(({ displayName }) =>
                displayName.toLowerCase().includes(searchValue.toLowerCase()),
            ),
        [permissions, searchValue],
    );

    const grantedPermissionCount = filteredPermissions.reduce(
        (count, permission) =>
            count +
            environments.filter((environment) =>
                Boolean(
                    permissionsByEnvironment[environment.name]?.find(
                        ({ name }) => name === permission.name,
                    )?.hasPermission,
                ),
            ).length,
        0,
    );

    return (
        <StyledAccessPanel>
            <StyledMatrixHeader>
                <StyledMatrixTitle>Environment access</StyledMatrixTitle>
                <StyledMatrixSummary>
                    {grantedPermissionCount}/
                    {filteredPermissions.length * environments.length}{' '}
                    environment permissions
                </StyledMatrixSummary>
            </StyledMatrixHeader>
            <TableContainer sx={{ maxHeight: 520, overflow: 'auto' }}>
                <Table size='small' stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Permission</TableCell>
                            {environments.map((environment) => (
                                <TableCell
                                    key={environment.name}
                                    align='center'
                                >
                                    {environment.name}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPermissions.map((permission) => (
                            <TableRow key={permission.name}>
                                <TableCell>{permission.displayName}</TableCell>
                                {environments.map((environment) => {
                                    const hasPermission = Boolean(
                                        permissionsByEnvironment[
                                            environment.name
                                        ]?.find(
                                            ({ name }) =>
                                                name === permission.name,
                                        )?.hasPermission,
                                    );

                                    return (
                                        <TableCell
                                            key={environment.name}
                                            align='center'
                                        >
                                            <PermissionMatrixStatus
                                                hasPermission={hasPermission}
                                            />
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </StyledAccessPanel>
    );
};

const PermissionMatrixStatus = ({
    hasPermission,
}: {
    hasPermission: boolean;
}) => (
    <Tooltip title={hasPermission ? 'Has permission' : 'No permission'}>
        <StyledMatrixStatus hasPermission={hasPermission}>
            {hasPermission ? <Check /> : <Close />}
        </StyledMatrixStatus>
    </Tooltip>
);
