import { Avatar, styled, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { IAchievement, IAchievementDefinition } from 'interfaces/achievement';
import { formatDateYMD } from 'utils/formatDate';

const StyledCard = styled('div')<{ unlocked: boolean }>(({ unlocked }) => ({
    opacity: unlocked ? 1 : 0.5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
}));

const StyledCardBody = styled('div')(({ theme }) => ({
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
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

interface IAchievementCardProps {
    definition?: IAchievementDefinition;
    achievement?: IAchievement;
}

export const AchievementCard = ({
    definition,
    achievement,
}: IAchievementCardProps) => {
    const { locationSettings } = useLocationSettings();
    const unlocked = achievement !== undefined;

    return (
        <StyledCard unlocked={Boolean(achievement)}>
            <StyledCardBody>
                <StyledCardAvatar
                    variant="rounded"
                    src={definition?.imageUrl}
                />
                <StyledCardBodyDescription>
                    <StyledCardTitle>{definition?.title}</StyledCardTitle>
                    <StyledCardDescription>
                        {definition?.description}
                    </StyledCardDescription>
                    <StyledCardDescription>
                        {achievement?.rarity}
                    </StyledCardDescription>
                </StyledCardBodyDescription>
            </StyledCardBody>
            <ConditionallyRender
                condition={unlocked}
                show={
                    <StyledCardDescription>
                        Unlocked at{' '}
                        {formatDateYMD(
                            achievement?.unlockedAt!,
                            locationSettings.locale
                        )}
                    </StyledCardDescription>
                }
            />
        </StyledCard>
    );
};
