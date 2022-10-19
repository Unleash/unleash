import { Achievement } from 'constants/achievements';
import { useAchievementsApi } from 'hooks/api/actions/useAchievementsApi/useAchievementsApi';
import { IAchievement } from 'interfaces/achievement';
import { ReactElement, useMemo, useState, ReactNode } from 'react';
import { AchievementContext } from '../AchievementContext/AchievementContext';
import { AchievementPopup } from '../AchievementPopup/AchievementPopup';

interface IAnnouncerProviderProps {
    children: ReactNode;
}

export const AchievementProvider = ({
    children,
}: IAnnouncerProviderProps): ReactElement => {
    const { unlockAchievement } = useAchievementsApi();

    const [newAchievements, setNewAchievements] = useState<IAchievement[]>([]);

    const value = useMemo(
        () => ({
            unlockAchievement: async (achievement: Achievement) => {
                const newAchievement = await unlockAchievement(achievement);

                if (newAchievement?.id !== -1) {
                    setNewAchievements(prevAchievements => [
                        ...prevAchievements,
                        newAchievement,
                    ]);
                }
            },
        }),
        [setNewAchievements]
    );

    return (
        <AchievementContext.Provider value={value}>
            {children}
            <AchievementPopup
                newAchievements={newAchievements}
                setNewAchievements={setNewAchievements}
            />
        </AchievementContext.Provider>
    );
};
