import { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { Alert } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import {
    PROJECT_SETTINGS_READ,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import EditProject from './EditProject/EditProject.tsx';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';

export const Settings = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { isOss } = useUiConfig();
    usePageTitle(`Project configuration – ${projectName}`);

    if (isOss()) {
        return (
            <PageContent
                header={<PageHeader title='General settings' />}
                sx={{ justifyContent: 'center' }}
            >
                <PremiumFeature feature='project-settings' />
            </PageContent>
        );
    }

    if (!hasAccess([UPDATE_PROJECT, PROJECT_SETTINGS_READ], projectId)) {
        return (
            <PageContent header={<PageHeader title='General settings' />}>
                <Alert severity='error'>
                    You need project owner permissions or a custom role with
                    "project setting access permission" to access this section.
                </Alert>
            </PageContent>
        );
    }

    return <EditProject />;
};
