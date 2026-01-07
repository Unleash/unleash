import { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Alert } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import {
    PROJECT_CHANGE_REQUEST_READ,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { ChangeRequestTable } from './ChangeRequestTable.tsx';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { ChangeRequestProcessHelp } from './ChangeRequestProcessHelp/ChangeRequestProcessHelp.tsx';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';

export const ChangeRequestConfiguration = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { isOss, isPro } = useUiConfig();

    usePageTitle(`Project change request configuration – ${projectName}`);

    if (isOss() || isPro()) {
        return (
            <PageContent
                header={
                    <PageHeader
                        titleElement='Change request configuration'
                        actions={<ChangeRequestProcessHelp />}
                    />
                }
                sx={{ justifyContent: 'center' }}
            >
                <PremiumFeature feature='change-requests' />
            </PageContent>
        );
    }

    if (!hasAccess([UPDATE_PROJECT, PROJECT_CHANGE_REQUEST_READ], projectId)) {
        return (
            <PageContent
                header={<PageHeader title='Change request configuration' />}
            >
                <Alert severity='error'>
                    You need project owner permissions or a custom role with
                    "view change request configuration" to access this section.
                </Alert>
            </PageContent>
        );
    }

    return <ChangeRequestTable />;
};
