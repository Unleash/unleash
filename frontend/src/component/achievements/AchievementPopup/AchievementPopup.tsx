import { Avatar, styled, Typography } from '@mui/material';
import { IAchievement, IAchievementUnlock } from 'interfaces/achievement';
import React, { useEffect, useState } from 'react';
import { Timer } from './Timer';
import { useNavigate } from 'react-router-dom';
import { useAchievementsApi } from 'hooks/api/actions/useAchievementsApi/useAchievementsApi';
import { useAchievements } from 'hooks/api/getters/useAchievements/useAchievements';

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
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledRarityDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.primary.main,
}));

let timeout: Timer;

interface AchievementPopupProps {
    newUnlocks: IAchievementUnlock[];
    setNewUnlocks: React.Dispatch<React.SetStateAction<IAchievementUnlock[]>>;
}

export const AchievementPopup = ({
    newUnlocks,
    setNewUnlocks,
}: AchievementPopupProps) => {
    const navigate = useNavigate();
    const { achievements } = useAchievements();
    const { markAchievementSeen } = useAchievementsApi();

    const [visible, setVisible] = useState(false);
    const [ready, setReady] = useState(true);
    const [achievement, setAchievement] = useState<IAchievement | null>(null);

    const showAchievement = (unlock: IAchievementUnlock) => {
        const achievement = achievements.find(
            achievement => achievement.id === unlock.achievementId
        );
        if (achievement) {
            setReady(false);
            setAchievement(achievement);
            markAchievementSeen(unlock.id);
            setNewUnlocks(prevUnlocks =>
                prevUnlocks.filter(({ id }) => id !== unlock.id)
            );
            setVisible(true);
            timeout = new Timer(() => {
                setVisible(false);
                setTimeout(() => {
                    setReady(true);
                }, 300);
            }, 5000);
        }
    };

    useEffect(() => {
        if (newUnlocks.length > 0 && ready) {
            showAchievement(newUnlocks[0]);
        }
    }, [ready, newUnlocks]);

    return (
        <StyledPopup
            visible={visible}
            onMouseEnter={() => timeout.pause()}
            onMouseLeave={() => timeout.resume()}
            onClick={() => navigate('/profile/achievements')}
        >
            <StyledHeader>Achievement unlocked!</StyledHeader>
            <StyledPopupBody>
                <StyledAvatar variant="rounded" src={achievement?.imageUrl} />
                <StyledPopupDescription>
                    <StyledTitle>{achievement?.title}</StyledTitle>
                    <StyledDescription>
                        {achievement?.description}
                    </StyledDescription>
                    <StyledRarityDescription>
                        {achievement?.rarity}% of users have this achievement
                    </StyledRarityDescription>
                </StyledPopupDescription>
            </StyledPopupBody>
        </StyledPopup>
    );
};
