import { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Alert } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import { ChangeRequestTable } from './ChangeRequestTable';

export const ChangeRequestConfiguration = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { isOss } = useUiConfig();
    usePageTitle(`Project change request – ${projectName}`);

    if (isOss()) {
        return (
            <PageContent
                header={<PageHeader title="Change request configuration" />}
            >
                <Alert severity="error">
                    Controlling change request configuration requires the
                    Enterprise version of Unleash. Check out{' '}
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

    return <ChangeRequestTable />;
};
