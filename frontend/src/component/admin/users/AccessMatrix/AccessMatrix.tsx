import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUserInfo from 'hooks/api/getters/useUserInfo/useUserInfo';
import { PermissionsTable } from './PermissionsTable';
import { styled, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import theme from 'themes/theme';
import { StringParam, useQueryParams } from 'use-query-params';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { AccessMatrixSelect } from './AccessMatrixSelect';
import { useUserAccessMatrix } from 'hooks/api/getters/useUserAccessMatrix/useUserAccessMatrix';

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

const StyledTitle = styled('h2')(({ theme }) => ({
    margin: theme.spacing(2, 0),
}));

export const AccessMatrix = () => {
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

    const { matrix, rootRole, projectRoles } = useUserAccessMatrix(
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
            <AccessMatrixSelect
                label='Project'
                options={projects}
                getOptionLabel={(option) => option?.name ?? ''}
                value={projects.find(({ id }) => id === project)}
                setValue={(value) => setProject(value?.id ?? '')}
            />
            <AccessMatrixSelect
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
                    title={`Access for ${user.name ?? user.username}`}
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
            <StyledTitle>
                Root permissions for role {rootRole?.name}
            </StyledTitle>
            <PermissionsTable permissions={matrix?.root ?? []} />
            <StyledTitle>
                Project permissions for project {project} with project roles [
                {projectRoles?.map((role: any) => role.name).join(', ')}]
            </StyledTitle>
            <PermissionsTable permissions={matrix?.project ?? []} />
            <StyledTitle>
                Environment permissions for environment {environment}
            </StyledTitle>
            <PermissionsTable permissions={matrix?.environment ?? []} />
        </PageContent>
    );
};
