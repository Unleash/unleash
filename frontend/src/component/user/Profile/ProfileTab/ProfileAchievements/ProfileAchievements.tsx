import {
    Avatar,
    DividerProps,
    styled,
    Tooltip,
    tooltipClasses,
    TooltipProps,
} from '@mui/material';
import { useAchievements } from 'hooks/api/getters/useAchievements/useAchievements';
import { useNavigate } from 'react-router-dom';
import { ProfileAchievementsTooltip } from './ProfileAchievementsTooltip/ProfileAchievementsTooltip';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[2],
        color: theme.palette.text.primary,
    },
}));

const StyledAchievementAvatar = styled(Avatar)(({ theme }) => ({
    cursor: 'pointer',
    width: theme.spacing(4),
    height: theme.spacing(4),
}));

export const ProfileAchievements = (props: DividerProps) => {
    const navigate = useNavigate();
    const { achievements = [], unlocks = [] } = useAchievements();

    const unlockedAchievements = achievements.filter(achievement =>
        unlocks.find(({ achievementId }) => achievementId === achievement.id)
    );

    const rarestUnlockedAchievements = unlockedAchievements
        .sort(({ rarity: a }, { rarity: b }) => parseFloat(a) - parseFloat(b))
        .slice(0, 5);

    return (
        <div {...props}>
            {rarestUnlockedAchievements.map(achievement => (
                <StyledTooltip
                    key={achievement.id}
                    title={
                        <ProfileAchievementsTooltip achievement={achievement} />
                    }
                >
                    <StyledAchievementAvatar
                        variant="rounded"
                        src={achievement.imageUrl}
                        onClick={() => navigate('/profile/achievements')}
                    />
                </StyledTooltip>
            ))}
        </div>
    );
};
