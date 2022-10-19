import { Avatar, styled, Typography } from '@mui/material';
import { IAchievement } from 'interfaces/achievement';

const StyledTooltipBody = styled('div')(({ theme }) => ({
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
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
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
                <StyledTooltipDescription>
                    {achievement?.rarity}
                </StyledTooltipDescription>
            </StyledTooltipBodyDescription>
        </StyledTooltipBody>
    );
};
