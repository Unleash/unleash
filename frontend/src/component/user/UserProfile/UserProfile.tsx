import { useState } from 'react';
import { Button, styled } from '@mui/material';
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

export const UserProfile = ({ profile }: IUserProfileProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const showProfile = Boolean(anchorEl);
    const modalId = useId();

    return (
        <StyledProfileContainer>
            <Button
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textTransform: 'none',
                }}
                aria-controls={showProfile ? modalId : undefined}
                aria-expanded={showProfile}
                aria-haspopup='true'
                onClick={(event) => setAnchorEl(event.currentTarget)}
            >
                <StyledUserAvatar
                    user={profile}
                    data-testid={HEADER_USER_AVATAR}
                    disableTooltip
                />
                {showProfile ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Button>

            <UserProfileContent
                id={modalId}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                profile={profile}
            />
        </StyledProfileContainer>
    );
};
