import { useState } from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import { NewProfileContent } from './UserProfileContent/NewProfileContent.tsx';
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

export const NewUserProfile = ({ profile }: IUserProfileProps) => {
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
                />
                <Box sx={{ mr: 0.5, textAlign: 'left' }}>
                    <Typography
                        variant='body2'
                        sx={{
                            fontWeight: 'medium',
                        }}
                    >
                        {profile.name || profile.username}
                    </Typography>
                    <StyledSubtitle variant='body2' title={profile.email}>
                        {profile.email}
                    </StyledSubtitle>
                </Box>
                {showProfile ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Button>

            <NewProfileContent
                id={modalId}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
            />
        </StyledProfileContainer>
    );
};
