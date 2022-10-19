import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IAchievement, IAchievementResult } from 'interfaces/achievement';
import { useMemo } from 'react';
import { Achievements } from 'constants/achievements';

export interface IUseAchievementsOutput {
    achievements?: IAchievement[];
    refetchAchievements: () => void;
    loading: boolean;
    error?: Error;
}

export const useAchievements = (): IUseAchievementsOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath('api/admin/user/achievements'),
        fetcher
    );

    return useMemo(
        () => ({
            achievements: mapAchievements(data?.achievements ?? []),
            loading: !error && !data,
            refetchAchievements: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const mapAchievements = (achievements: IAchievementResult[]) => {
    const filteredAchievements = achievements.filter(({ achievementId }) =>
        Object.keys(Achievements).includes(achievementId)
    );

    return filteredAchievements.map(achievement => {
        const { title, description, imageUrl } =
            Achievements[
                achievement.achievementId as keyof typeof Achievements
            ];

        return {
            ...achievement,
            title,
            description,
            imageUrl,
        };
    });
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Achievements'))
        .then(res => res.json());
};
