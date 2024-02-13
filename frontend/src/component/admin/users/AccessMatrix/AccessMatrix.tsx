import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUserInfo from 'hooks/api/getters/useUserInfo/useUserInfo';
import { useUserAccessMatrix } from './useUserAccessMatrix';
import useQueryParams from 'hooks/useQueryParams';
import { PermissionsTable } from './PermissionsTable';
import { styled } from '@mui/material';

const StyledTitle = styled('h2')(({ theme }) => ({
    margin: theme.spacing(2, 0),
}));

export const AccessMatrix = () => {
    const id = useRequiredPathParam('id');
    const query = useQueryParams();
    const project = query.get('project');
    const environment = query.get('environment');
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
                <PageHeader
                    title={`Access for ${user.name ?? user.username}`}
                    actions={<PageHeader.Divider />}
                />
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
