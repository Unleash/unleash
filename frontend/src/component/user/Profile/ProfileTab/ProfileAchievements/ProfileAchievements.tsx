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
    const { achievements } = useAchievements();

    return (
        <div {...props}>
            {achievements?.slice(0, 5).map(achievement => (
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
