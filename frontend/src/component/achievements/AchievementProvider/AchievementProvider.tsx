import { Achievement } from 'constants/achievements';
import { useAchievementsApi } from 'hooks/api/actions/useAchievementsApi/useAchievementsApi';
import { useAchievements } from 'hooks/api/getters/useAchievements/useAchievements';
import { IAchievementUnlock } from 'interfaces/achievement';
import { ReactElement, useMemo, useState, ReactNode } from 'react';
import { AchievementContext } from '../AchievementContext/AchievementContext';
import { AchievementPopup } from '../AchievementPopup/AchievementPopup';

interface IAnnouncerProviderProps {
    children: ReactNode;
}

export const AchievementProvider = ({
    children,
}: IAnnouncerProviderProps): ReactElement => {
    const { refetchAchievements } = useAchievements();
    const { unlockAchievement } = useAchievementsApi();

    const [newUnlocks, setNewUnlocks] = useState<IAchievementUnlock[]>([]);

    const value = useMemo(
        () => ({
            unlockAchievement: async (achievement: Achievement) => {
                const newUnlock = await unlockAchievement(achievement);
                await refetchAchievements();

                if (newUnlock?.id !== -1) {
                    setNewUnlocks(prevUnlocks => [...prevUnlocks, newUnlock]);
                }
            },
        }),
        [setNewUnlocks]
    );

    return (
        <AchievementContext.Provider value={value}>
            {children}
            <AchievementPopup
                newUnlocks={newUnlocks}
                setNewUnlocks={setNewUnlocks}
            />
        </AchievementContext.Provider>
    );
};
