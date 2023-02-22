import { useState } from 'react';
import { Button, ClickAwayListener, styled } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { UserProfileContent } from './UserProfileContent/UserProfileContent';
import { IUser } from 'interfaces/user';
import { HEADER_USER_AVATAR } from 'utils/testIds';
import { useId } from 'hooks/useId';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { flexRow, focusable, itemsCenter } from 'themes/themeStyles';

const StyledUserAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
}));

const StyledProfileContainer = styled('div')(({ theme }) => ({
    position: 'relative',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    ...focusable(theme),
    ...flexRow,
    ...itemsCenter,
    color: 'inherit',
    padding: theme.spacing(0.5, 2),
    '&:hover': {
        backgroundColor: 'transparent',
    },
}));

const StyledIcon = styled(KeyboardArrowDownIcon)(({ theme }) => ({
    color: theme.palette.neutral.main,
}));

interface IUserProfileProps {
    profile: IUser;
}

const UserProfile = ({ profile }: IUserProfileProps) => {
    const [showProfile, setShowProfile] = useState(false);
    const modalId = useId();

    return (
        <ClickAwayListener onClickAway={() => setShowProfile(false)}>
            <StyledProfileContainer>
                <StyledButton
                    onClick={() => setShowProfile(prev => !prev)}
                    aria-controls={showProfile ? modalId : undefined}
                    aria-expanded={showProfile}
                    color="secondary"
                    disableRipple
                >
                    <StyledUserAvatar
                        user={profile}
                        data-testid={HEADER_USER_AVATAR}
                    />
                    <StyledIcon />
                </StyledButton>
                <UserProfileContent
                    id={modalId}
                    showProfile={showProfile}
                    setShowProfile={setShowProfile}
                    profile={profile}
                />
            </StyledProfileContainer>
        </ClickAwayListener>
    );
};

export default UserProfile;
