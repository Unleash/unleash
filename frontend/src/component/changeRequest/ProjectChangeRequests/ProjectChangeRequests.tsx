import { usePageTitle } from 'hooks/usePageTitle';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import { ChangeRequestsTabs } from './ChangeRequestsTabs/ChangeRequestsTabs';
import { SortingRule } from 'react-table';
import { useProjectChangeRequests } from 'hooks/api/getters/useProjectChangeRequests/useProjectChangeRequests';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';

const defaultSort: SortingRule<string> = { id: 'updatedAt', desc: true };

export const ProjectChangeRequests = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { isOss, isPro } = useUiConfig();

    usePageTitle(`Change requests – ${projectName}`);

    const { changeRequests, loading } = useProjectChangeRequests(projectId);

    const { value, setValue } = createLocalStorage(
        `${projectId}:ProjectChangeRequest`,
        defaultSort
    );

    if (isOss() || isPro()) {
        return (
            <PageContent sx={{ justifyContent: 'center' }}>
                <PremiumFeature feature="Change Requests" />
            </PageContent>
        );
    }

    return (
        <ChangeRequestsTabs
            changeRequests={changeRequests}
            storedParams={value}
            setStoredParams={setValue}
            projectId={projectId}
            loading={loading}
        />
    );
};
