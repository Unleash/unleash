import { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Alert } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { ProjectAccessTable } from 'component/project/ProjectAccess/ProjectAccessTable/ProjectAccessTable';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';

export const ProjectAccess = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { isOss } = useUiConfig();
    usePageTitle(`Project access – ${projectName}`);

    if (isOss()) {
        return (
            <PageContent header={<PageHeader title="Project access" />}>
                <Alert severity="error">
                    Controlling access to projects requires a paid version of
                    Unleash. Check out{' '}
                    <a
                        href="https://www.getunleash.io"
                        target="_blank"
                        rel="noreferrer"
                    >
                        getunleash.io
                    </a>{' '}
                    to find out more.
                </Alert>
            </PageContent>
        );
    }

    if (!hasAccess(UPDATE_PROJECT, projectId)) {
        return (
            <PageContent header={<PageHeader title="Project access" />}>
                <Alert severity="error">
                    You need project owner permissions to access this section.
                </Alert>
            </PageContent>
        );
    }

    return <ProjectAccessTable />;
};
