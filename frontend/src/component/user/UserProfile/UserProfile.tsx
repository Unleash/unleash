import { useState } from 'react';
import { ClickAwayListener, IconButton, Tooltip, styled } from '@mui/material';
import { UserProfileContent } from './UserProfileContent/UserProfileContent';
import { IUser } from 'interfaces/user';
import { HEADER_USER_AVATAR } from 'utils/testIds';
import { useId } from 'hooks/useId';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { flexRow, itemsCenter } from 'themes/themeStyles';

const StyledUserAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
}));

const StyledProfileContainer = styled('div')(({ theme }) => ({
    position: 'relative',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    ...flexRow,
    ...itemsCenter,
    color: 'inherit',
    padding: theme.spacing(1),
    '&:focus-visible': {
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineColor: theme.palette.primary.main,
        borderRadius: '100%',
    },
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
                <Tooltip title='Profile' arrow>
                    <StyledIconButton
                        onClick={() => setShowProfile((prev) => !prev)}
                        aria-controls={showProfile ? modalId : undefined}
                        aria-expanded={showProfile}
                        color='secondary'
                        size='large'
                    >
                        <StyledUserAvatar
                            user={profile}
                            data-testid={HEADER_USER_AVATAR}
                        />
                    </StyledIconButton>
                </Tooltip>
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
