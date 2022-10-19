import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IAchievement, IAchievementDefinition } from 'interfaces/achievement';

export interface IUseAchievementsOutput {
    achievements?: IAchievement[];
    all: IAchievementDefinition[];
    refetchAchievements: () => void;
    loading: boolean;
    error?: Error;
}

export const useAchievements = (): IUseAchievementsOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath('api/admin/user/achievements'),
        fetcher
    );

    return {
        achievements: data ? data.achievements : undefined,
        all: data ? data.all : undefined,
        loading: !error && !data,
        refetchAchievements: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Achievements'))
        .then(res => res.json());
};
