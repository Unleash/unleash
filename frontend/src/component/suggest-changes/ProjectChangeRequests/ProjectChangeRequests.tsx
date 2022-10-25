import { ChangesetTable } from '../ChangesetTable/ChangesetTable';
import { createLocalStorage } from '../../../utils/createLocalStorage';
import { SortingRule } from 'react-table';
import { useRequiredPathParam } from '../../../hooks/useRequiredPathParam';
import { useProjectNameOrId } from '../../../hooks/api/getters/useProject/useProject';
import { usePageTitle } from '../../../hooks/usePageTitle';

const defaultSort: SortingRule<string> = { id: 'id' };

export const ProjectChangeRequests = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    usePageTitle(`Change requests – ${projectName}`);

    const changesets: any[] = [
        {
            id: 1,
            state: 'Review',
            project: 'default',
            environment: 'production',
            createdBy: {
                id: 1,
                username: 'someuser',
                imageUrl:
                    'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
            },
            createdAt: '2022-10-25 08:54:000Z',
            updatedAt: '2022-10-25 08:54:000Z',
            changes: [
                {
                    id: 1,
                    action: 'updateEnabled',
                    feature: 'feature1',
                    payload: {
                        environmnent: 'production',
                    },
                },
                {
                    id: 2,
                    action: 'strategyAdd',
                    feature: 'feature1',
                    payload: {
                        environmnent: 'production',
                    },
                },
            ],
        },
    ];

    const refetch = async () => Promise.resolve();

    const { value, setValue } = createLocalStorage(
        `${projectId}:ProjectChangeRequests`,
        defaultSort
    );

    return (
        <ChangesetTable
            title={'Suggestions'}
            changesets={changesets}
            loading={false}
            refetch={refetch}
            storedParams={value}
            setStoredParams={setValue}
        />
    );
};
