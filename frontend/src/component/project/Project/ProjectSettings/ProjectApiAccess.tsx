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
import { ApiTokenTable } from '../../../admin/apiToken/ApiTokenTable/ApiTokenTable';

export const ProjectApiAccess = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { isOss, isPro } = useUiConfig();

    usePageTitle(`Project api access – ${projectName}`);

    // if (isOss() || isPro()) {
    //     return (
    //         <PageContent
    //             header={<PageHeader titleElement="Api access" />}
    //             sx={{ justifyContent: 'center' }}
    //         >
    //             <PremiumFeature feature="access" />
    //         </PageContent>
    //     );
    // }

    if (!hasAccess(UPDATE_PROJECT, projectId)) {
        return (
            <PageContent header={<PageHeader title="Api access" />}>
                <Alert severity="error">
                    You need project owner or admin permissions to access this
                    section.
                </Alert>
            </PageContent>
        );
    }

    return (
        <div style={{ width: '100%', overflow: 'hidden' }}>
            <ApiTokenTable compact />
        </div>
    );
};
