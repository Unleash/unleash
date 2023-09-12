import { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { Alert } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import EditProject from './EditProject';
import { PremiumFeature } from '../../../../common/PremiumFeature/PremiumFeature';
import useUiConfig from '../../../../../hooks/api/getters/useUiConfig/useUiConfig';

export const Settings = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { isOss } = useUiConfig();
    usePageTitle(`Project configuration – ${projectName}`);

    if (isOss()) {
        return (
            <PageContent
                header={<PageHeader title="Access" />}
                sx={{ justifyContent: 'center' }}
            >
                <PremiumFeature feature="project-settings" />
            </PageContent>
        );
    }

    if (!hasAccess(UPDATE_PROJECT, projectId)) {
        return (
            <PageContent header={<PageHeader title="Access" />}>
                <Alert severity="error">
                    You need project owner permissions to access this section.
                </Alert>
            </PageContent>
        );
    }

    return <EditProject />;
};
