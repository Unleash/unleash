import { Avatar, styled, Typography } from '@mui/material';
import { IAchievement } from 'interfaces/achievement';

const StyledTooltipBody = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'row',
}));

const StyledTooltipAvatar = styled(Avatar)(({ theme }) => ({
    marginRight: theme.spacing(2),
    width: theme.spacing(7),
    height: theme.spacing(7),
}));

const StyledTooltipBodyDescription = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
}));

const StyledTooltipTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

const StyledTooltipDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledTooltipRarityDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.primary.main,
}));

export const ProfileAchievementsTooltip = ({
    achievement,
}: {
    achievement: IAchievement;
}) => {
    return (
        <StyledTooltipBody>
            <StyledTooltipAvatar
                variant="rounded"
                src={achievement?.imageUrl}
            />
            <StyledTooltipBodyDescription>
                <StyledTooltipTitle>{achievement?.title}</StyledTooltipTitle>
                <StyledTooltipDescription>
                    {achievement?.description}
                </StyledTooltipDescription>
                <StyledTooltipRarityDescription>
                    {achievement?.rarity}% of users have this achievement
                </StyledTooltipRarityDescription>
            </StyledTooltipBodyDescription>
        </StyledTooltipBody>
    );
};
