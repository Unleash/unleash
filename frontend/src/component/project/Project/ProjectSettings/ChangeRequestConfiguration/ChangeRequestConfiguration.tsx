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
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { ChangeRequestProcessHelp } from './ChangeRequestProcessHelp/ChangeRequestProcessHelp';

export const ChangeRequestConfiguration = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { isOss, isPro } = useUiConfig();

    usePageTitle(`Project change request configuration – ${projectName}`);

    if (isOss() || isPro()) {
        return (
            <PageContent
                header={
                    <PageHeader
                        titleElement="Change request configuration"
                        actions={<ChangeRequestProcessHelp />}
                    />
                }
                sx={{ justifyContent: 'center' }}
            >
                <PremiumFeature feature="change-requests" />
            </PageContent>
        );
    }

    if (!hasAccess(UPDATE_PROJECT, projectId)) {
        return (
            <PageContent
                header={<PageHeader title="Change request configuration" />}
            >
                <Alert severity="error">
                    You need project owner permissions to access this section.
                </Alert>
            </PageContent>
        );
    }

    return <ChangeRequestTable />;
};
