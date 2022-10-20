import { Avatar, styled, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { IAchievement, IAchievementUnlock } from 'interfaces/achievement';
import { formatDateYMD } from 'utils/formatDate';

const StyledCard = styled('div')<{ unlocked: boolean }>(({ unlocked }) => ({
    opacity: unlocked ? 1 : 0.5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
}));

const StyledCardBody = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'row',
}));

const StyledCardAvatar = styled(Avatar)(({ theme }) => ({
    marginRight: theme.spacing(2),
    width: theme.spacing(7),
    height: theme.spacing(7),
}));

const StyledCardBodyDescription = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
}));

const StyledCardTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

const StyledCardDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledCardRarityDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.primary.main,
}));

interface IAchievementCardProps {
    achievement?: IAchievement;
    unlock?: IAchievementUnlock;
}

export const AchievementCard = ({
    achievement,
    unlock,
}: IAchievementCardProps) => {
    const { locationSettings } = useLocationSettings();
    const unlocked = Boolean(unlock);

    return (
        <StyledCard unlocked={unlocked}>
            <StyledCardBody>
                <StyledCardAvatar
                    variant="rounded"
                    src={achievement?.imageUrl}
                />
                <StyledCardBodyDescription>
                    <StyledCardTitle>{achievement?.title}</StyledCardTitle>
                    <StyledCardDescription>
                        {achievement?.description}
                    </StyledCardDescription>
                    <StyledCardRarityDescription>
                        {achievement?.rarity}% of users have this achievement
                    </StyledCardRarityDescription>
                </StyledCardBodyDescription>
            </StyledCardBody>
            <ConditionallyRender
                condition={unlocked}
                show={
                    <StyledCardDescription>
                        Unlocked at{' '}
                        {formatDateYMD(
                            unlock?.unlockedAt!,
                            locationSettings.locale
                        )}
                    </StyledCardDescription>
                }
            />
        </StyledCard>
    );
};
