import { usePageTitle } from 'hooks/usePageTitle';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import { SuggestionsTabs } from './SuggestionsTabs/SuggestionsTabs';
import { SortingRule } from 'react-table';
import { useProjectSuggestedChanges } from 'hooks/api/getters/useProjectSuggestedChanges/useProjectSuggestedChanges';

const defaultSort: SortingRule<string> = { id: 'updatedAt', desc: true };

export const ProjectSuggestedChanges = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);

    usePageTitle(`Change requests – ${projectName}`);

    const { changesets, loading } = useProjectSuggestedChanges(projectId);

    const { value, setValue } = createLocalStorage(
        `${projectId}:ProjectChangeRequests`,
        defaultSort
    );

    return (
        <SuggestionsTabs
            changesets={changesets}
            storedParams={value}
            setStoredParams={setValue}
            projectId={projectId}
            loading={loading}
        />
    );
};
