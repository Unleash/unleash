import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {usePageTitle} from "../../../hooks/usePageTitle";
import {createLocalStorage} from "../../../utils/createLocalStorage";
import {useRequiredPathParam} from "../../../hooks/useRequiredPathParam";
import {useProjectNameOrId} from "../../../hooks/api/getters/useProject/useProject";
import { useStyles } from "./ProjectSuggestions.styles";
import { SuggestionsTable } from "./SuggestionsTable/SuggestionsTable";
import {SortingRule} from "react-table";


const defaultSort: SortingRule<string> = { id: 'updatedAt', desc: true };

export const ProjectSuggestions = () => {
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
        {
            id: 1,
            state: 'Closed',
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
        {
            id: 1,
            state: 'Closed',
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
        {
            id: 1,
            state: 'Rejected',
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
        {
            id: 1,
            state: 'Approved',
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
            <SuggestionsTable
                changesets={changesets}
                storedParams={value}
                setStoredParams={setValue}
                refetch={refetch}
                projectId={projectId}
                title={''}
                loading={false}
            />
    )
}
