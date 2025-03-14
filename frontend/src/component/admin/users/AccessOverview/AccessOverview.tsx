import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUserInfo from 'hooks/api/getters/useUserInfo/useUserInfo';
import { styled, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import theme from 'themes/theme';
import { StringParam, useQueryParams } from 'use-query-params';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { AccessOverviewSelect } from './AccessOverviewSelect';
import { useUserAccessOverview } from 'hooks/api/getters/useUserAccessOverview/useUserAccessOverview';
import { AccessOverviewAccordion } from './AccessOverviewAccordion/AccessOverviewAccordion';

const StyledActionsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flex: 1,
    gap: theme.spacing(1),
    maxWidth: 600,
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        maxWidth: '100%',
    },
}));

const StyledAccessOverviewContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

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

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Access overview for ${user.name ?? user.username}`}
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
                <AccessOverviewAccordion permissions={overview?.root ?? []}>
                    Root permissions for role {rootRole?.name}
                </AccessOverviewAccordion>
                <AccessOverviewAccordion permissions={overview?.project ?? []}>
                    Project permissions
                    {project
                        ? ` for project ${project}${projectRoles?.length ? ` with project role${projectRoles.length !== 1 ? 's' : ''} ${projectRoles?.map((role: any) => role.name).join(', ')}` : ''}`
                        : ''}
                </AccessOverviewAccordion>
                {environment && (
                    <AccessOverviewAccordion
                        permissions={overview?.environment ?? []}
                    >
                        Environment permissions for {environment}
                    </AccessOverviewAccordion>
                )}
            </StyledAccessOverviewContainer>
        </PageContent>
    );
};
