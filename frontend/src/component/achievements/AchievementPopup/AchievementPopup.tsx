import { Avatar, styled, Typography } from '@mui/material';
import { IAchievement } from 'interfaces/achievement';
import { useEffect, useState } from 'react';
import { Timer } from './Timer';
import { useNavigate } from 'react-router-dom';
import { useAchievements } from 'hooks/api/getters/useAchievements/useAchievements';
import { useAchievementsApi } from 'hooks/api/actions/useAchievementsApi/useAchievementsApi';

const StyledPopup = styled('div')<{ visible: boolean }>(
    ({ theme, visible }) => ({
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'fixed',
        bottom: theme.spacing(4),
        right: theme.spacing(4),
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(3),
        borderRadius: theme.shape.borderRadius,
        zIndex: theme.zIndex.tooltip,
        boxShadow: theme.shadows[2],
        transition: 'all 0.3s ease-in-out',
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
    })
);

const StyledHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

const StyledPopupBody = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    marginRight: theme.spacing(2),
    width: theme.spacing(7),
    height: theme.spacing(7),
}));

const StyledPopupDescription = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

const StyledDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

let timeout: Timer;

export const AchievementPopup = () => {
    const navigate = useNavigate();
    const { achievements } = useAchievements();
    const { markAchievementSeen } = useAchievementsApi();

    const [visible, setVisible] = useState(false);
    const [achievement, setAchievement] = useState<IAchievement | null>(null);

    const showAchievement = (achievement: IAchievement) => {
        setAchievement(achievement);
        markAchievementSeen(achievement.id);
        setVisible(true);
        timeout = new Timer(() => {
            setVisible(false);
        }, 5000);
    };

    // TODO: Is this the right approach?
    useEffect(() => {
        const newAchievements =
            achievements
                ?.sort(
                    (a, b) =>
                        new Date(a.unlockedAt).getTime() -
                        new Date(b.unlockedAt).getTime()
                )
                .filter(achievement => !achievement.seenAt) || [];

        if (newAchievements?.length) {
            showAchievement(newAchievements[0]);
        }
    }, [achievements]);

    return (
        <StyledPopup
            visible={visible}
            onMouseEnter={() => timeout.pause()}
            onMouseLeave={() => timeout.resume()}
            onClick={() => navigate('/profile')}
        >
            <StyledHeader>Achievement unlocked!</StyledHeader>
            <StyledPopupBody>
                <StyledAvatar
                    variant="rounded"
                    src="https://www.getunleash.io/logos/unleash_glyph_pos.svg"
                />
                <StyledPopupDescription>
                    <StyledTitle>{achievement?.title}</StyledTitle>
                    <StyledDescription>
                        {achievement?.description}
                    </StyledDescription>
                    <StyledDescription>{achievement?.rarity}</StyledDescription>
                </StyledPopupDescription>
            </StyledPopupBody>
        </StyledPopup>
    );
};
