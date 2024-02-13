import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUserInfo from 'hooks/api/getters/useUserInfo/useUserInfo';
import { useUserAccessMatrix } from './useUserAccessMatrix';
import useQueryParams from 'hooks/useQueryParams';
import { PermissionsTable } from './PermissionsTable';
import { Box, styled } from '@mui/material';
import { useState } from 'react';
import FeatureProjectSelect from 'component/feature/FeatureView/FeatureSettings/FeatureSettingsProject/FeatureProjectSelect/FeatureProjectSelect';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';

const StyledTitle = styled('h2')(({ theme }) => ({
    margin: theme.spacing(2, 0),
}));

export const AccessMatrix = () => {
    const id = useRequiredPathParam('id');
    const { environments } = useEnvironments();
    const selectableEnvs = environments.map((environment) => ({
        key: environment.name,
        label: `${environment.name.concat(
            !environment.enabled ? ' - deprecated' : '',
        )}`,
        title: environment.name,
        disabled: false,
    }));
    const query = useQueryParams();
    const [project, setProject] = useState(query.get('project') ?? '');
    const [environment, setEnvironment] = useState(
        query.get('environment') ?? undefined,
    );
    const { user, loading } = useUserInfo(id);

    const { matrix, rootRole, projectRoles } = useUserAccessMatrix(
        id,
        project ?? undefined,
        environment ?? undefined,
    );
    return (
        <PageContent
            isLoading={loading}
            header={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PageHeader
                        title={`Access for ${user.name ?? user.username}`}
                        actions={<PageHeader.Divider />}
                    />
                    <FeatureProjectSelect
                        value={project}
                        onChange={setProject}
                        label='Project'
                        filter={(_) => true}
                        enabled
                        fullWidth
                    />
                    <GeneralSelect
                        options={selectableEnvs}
                        value={environment}
                        onChange={setEnvironment}
                        label='Environment'
                        fullWidth
                    />
                </Box>
            }
        >
            <StyledTitle>
                Root permissions for role {rootRole?.name}
            </StyledTitle>
            <PermissionsTable permissions={matrix?.root ?? []} />
            <StyledTitle>
                Project permissions for project {project ?? 'undefined'} with
                project roles [
                {projectRoles?.map((role: any) => role.name).join(', ')}]
            </StyledTitle>
            <PermissionsTable permissions={matrix?.project ?? []} />
            <StyledTitle>
                Environment permissions {environment ?? 'undefined'}
            </StyledTitle>
            <PermissionsTable permissions={matrix?.environment ?? []} />
        </PageContent>
    );
};
