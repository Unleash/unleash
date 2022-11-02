import { usePageTitle } from 'hooks/usePageTitle';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import { ChangeRequestsTabs } from './ChangeRequestsTabs/ChangeRequestsTabs';
import { SortingRule } from 'react-table';
import { useProjectChangeRequests } from 'hooks/api/getters/useProjectChangeRequests/useProjectChangeRequests';

const defaultSort: SortingRule<string> = { id: 'updatedAt', desc: true };

export const ProjectChangeRequests = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);

    usePageTitle(`Change requests – ${projectName}`);

    const { changeRequests, loading } = useProjectChangeRequests(projectId);

    const { value, setValue } = createLocalStorage(
        `${projectId}:ProjectChangeRequest`,
        defaultSort
    );

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
