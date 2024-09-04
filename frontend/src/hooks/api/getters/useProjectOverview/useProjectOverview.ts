import useSWR, { type SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { getProjectOverviewFetcher } from './getProjectOverviewFetcher';
import type { IProjectOverview } from 'interfaces/project';

const fallbackProject: IProjectOverview = {
    featureTypeCounts: [],
    environments: [],
    name: '',
    health: 0,
    members: 0,
    version: '1',
    description: 'Default',
    favorite: false,
    mode: 'open',
    defaultStickiness: 'default',
    stats: {
        archivedCurrentWindow: 0,
        archivedPastWindow: 0,
        avgTimeToProdCurrentWindow: 0,
        createdCurrentWindow: 0,
        createdPastWindow: 0,
        projectActivityCurrentWindow: 0,
        projectActivityPastWindow: 0,
        projectMembersAddedCurrentWindow: 0,
    },
    onboardingStatus: {
        status: 'onboarded',
    },
};

const useProjectOverview = (id: string, options: SWRConfiguration = {}) => {
    const { KEY, fetcher } = getProjectOverviewFetcher(id);
    const { data, error, mutate } = useSWR<IProjectOverview>(
        KEY,
        fetcher,
        options,
    );

    const refetch = useCallback(() => {
        mutate();
    }, [mutate]);

    return {
        project: data || fallbackProject,
        loading: !error && !data,
        error,
        refetch,
    };
};

export const useProjectOverviewNameOrId = (id: string): string => {
    return useProjectOverview(id).project.name || id;
};

export const featuresCount = (
    project: Pick<IProjectOverview, 'featureTypeCounts'>,
) => {
    return project.featureTypeCounts
        .map((count) => count.count)
        .reduce((a, b) => a + b, 0);
};

export default useProjectOverview;
