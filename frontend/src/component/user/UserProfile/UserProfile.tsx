import { useState } from 'react';
import {
    Box,
    Button,
    ClickAwayListener,
    styled,
    Typography,
} from '@mui/material';
import { UserProfileContent } from './UserProfileContent/UserProfileContent.tsx';
import type { IUser } from 'interfaces/user';
import { useId } from 'hooks/useId';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { HEADER_USER_AVATAR } from 'utils/testIds';

const StyledProfileContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    marginLeft: theme.spacing(2),
    cursor: 'pointer',
}));

interface IUserProfileProps {
    profile: IUser;
}

const StyledUserAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
    marginRight: theme.spacing(1),
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: theme.spacing(35),
}));

const UserProfile = ({ profile }: IUserProfileProps) => {
    const [showProfile, setShowProfile] = useState(false);
    const modalId = useId();

    return (
        <ClickAwayListener onClickAway={() => setShowProfile(false)}>
            <StyledProfileContainer>
                <Button
                    component={Box}
                    sx={{ display: 'flex', alignItems: 'center' }}
                    aria-controls={showProfile ? modalId : undefined}
                    aria-expanded={showProfile}
                    onClick={() => setShowProfile((prev) => !prev)}
                >
                    <StyledUserAvatar
                        user={profile}
                        data-testid={HEADER_USER_AVATAR}
                    />
                    <Box sx={{ mr: 0.5 }}>
                        <Typography variant='body2' fontWeight='medium'>
                            {profile.name || profile.username}
                        </Typography>
                        <StyledSubtitle variant='body2' title={profile.email}>
                            {profile.email}
                        </StyledSubtitle>
                    </Box>
                    {showProfile ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Button>

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
