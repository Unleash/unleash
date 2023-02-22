import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import { ChangeRequestsTabs } from './ChangeRequestsTabs/ChangeRequestsTabs';
import { useProjectChangeRequests } from 'hooks/api/getters/useProjectChangeRequests/useProjectChangeRequests';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';

export const ProjectChangeRequests = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { isOss, isPro } = useUiConfig();

    usePageTitle(`Change requests – ${projectName}`);

    const { changeRequests, loading } = useProjectChangeRequests(projectId);

    if (isOss() || isPro()) {
        return (
            <PageContent sx={{ justifyContent: 'center' }}>
                <PremiumFeature feature="change-requests" />
            </PageContent>
        );
    }

    return (
        <ChangeRequestsTabs
            changeRequests={changeRequests}
            projectId={projectId}
            loading={loading}
        />
    );
};
