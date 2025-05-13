import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ChangeRequestsTabs } from './ChangeRequestsTabs/ChangeRequestsTabs.tsx';
import { useProjectChangeRequests } from 'hooks/api/getters/useProjectChangeRequests/useProjectChangeRequests';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useChangeRequestConfig } from 'hooks/api/getters/useChangeRequestConfig/useChangeRequestConfig';
import { Link } from 'react-router-dom';

export const ProjectChangeRequests = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const { isOss, isPro } = useUiConfig();

    usePageTitle(`Change requests – ${projectName}`);

    const { changeRequests, loading } = useProjectChangeRequests(projectId);
    const { data: configData, loading: configLoading } =
        useChangeRequestConfig(projectId);
    const isConfigured = configData.some(
        (config) => config.changeRequestEnabled,
    );

    if (isOss() || isPro()) {
        return (
            <PageContent sx={{ justifyContent: 'center' }}>
                <PremiumFeature feature='change-requests' />
            </PageContent>
        );
    }

    return (
        <ChangeRequestsTabs
            changeRequests={changeRequests}
            projectId={projectId}
            loading={loading}
            placeholder={
                !configLoading && !isConfigured ? (
                    <p>
                        Change requests are not configured for this project.
                        <br />
                        <Link
                            to={`/projects/${projectId}/settings/change-requests`}
                        >
                            Configure change requests
                        </Link>
                    </p>
                ) : undefined
            }
        />
    );
};
