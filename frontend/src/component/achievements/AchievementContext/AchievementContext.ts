import { Achievement } from 'constants/achievements';
import { createContext } from 'react';

export interface IAchievementContext {
    unlockAchievement: (achievement: Achievement) => void;
}

const unlockAchievementPlaceholder = () => {
    throw new Error('unlockAchievement called outside AchievementContext');
};

// AchievementContext announces new achievement unlocks through a popup.
export const AchievementContext = createContext<IAchievementContext>({
    unlockAchievement: unlockAchievementPlaceholder,
});
