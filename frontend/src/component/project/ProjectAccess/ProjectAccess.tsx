import { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Alert } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import {
    PROJECT_USER_ACCESS_READ,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { ProjectAccessTable } from 'component/project/ProjectAccess/ProjectAccessTable/ProjectAccessTable';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';

export const ProjectAccess = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { isOss } = useUiConfig();
    usePageTitle(`Project access – ${projectName}`);

    if (isOss()) {
        return (
            <PageContent
                header={<PageHeader title='User access' />}
                sx={{ justifyContent: 'center' }}
            >
                <PremiumFeature feature='access' />
            </PageContent>
        );
    }

    if (!hasAccess([UPDATE_PROJECT, PROJECT_USER_ACCESS_READ], projectId)) {
        return (
            <PageContent header={<PageHeader title='User access' />}>
                <Alert severity='error'>
                    You need project owner permissions or a custom role with
                    "view project user permission" to access this section.
                </Alert>
            </PageContent>
        );
    }

    return <ProjectAccessTable />;
};
