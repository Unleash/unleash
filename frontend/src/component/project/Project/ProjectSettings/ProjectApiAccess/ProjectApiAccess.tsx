import { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { Alert } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import { READ_PROJECT_API_TOKEN } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import { CreateProjectApiToken } from 'component/project/Project/ProjectSettings/ProjectApiAccess/CreateProjectApiToken';
import { Routes, Route } from 'react-router-dom';
import { ApiTokenTable } from 'component/admin/apiToken/ApiTokenTable/ApiTokenTable';
import { useProjectApiTokens } from 'hooks/api/getters/useProjectApiTokens/useProjectApiTokens';

export const ProjectApiAccess = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { tokens, loading } = useProjectApiTokens(projectId);

    usePageTitle(`Project api access – ${projectName}`);

    if (!hasAccess(READ_PROJECT_API_TOKEN, projectId)) {
        return (
            <PageContent header={<PageHeader title="Api access" />}>
                <Alert severity="error">
                    You need to be a member of the project or admin to access
                    this section.
                </Alert>
            </PageContent>
        );
    }

    return (
        <div style={{ width: '100%', overflow: 'hidden' }}>
            <ApiTokenTable
                tokens={tokens}
                loading={loading}
                compact
                filterForProject={projectId}
            />

            <Routes>
                <Route path="create" element={<CreateProjectApiToken />} />
            </Routes>
        </div>
    );
};
