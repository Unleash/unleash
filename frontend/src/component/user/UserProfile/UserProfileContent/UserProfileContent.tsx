import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Button, Paper, Typography, styled } from '@mui/material';
import { basePath } from 'utils/formatPath';
import { IUser } from 'interfaces/user';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { Link } from 'react-router-dom';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

const StyledPaper = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusMedium,
    boxShadow: theme.boxShadows.popup,
    position: 'absolute',
    zIndex: 5000,
    minWidth: theme.spacing(37.5),
    right: 0,
    [theme.breakpoints.down('md')]: {
        width: '100%',
        padding: '1rem',
    },
}));

const StyledProfileInfo = styled('div')(({ theme }) => ({
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
}));

const StyledUserAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(4.75),
    height: theme.spacing(4.75),
    marginRight: theme.spacing(1.5),
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledLinkButton = styled(Button<typeof Link | 'a'>)(({ theme }) => ({
    padding: 0,
    color: theme.palette.primary.dark,
    fontWeight: theme.fontWeight.medium,
}));

const StyledLinkPrivacyButton = styled(StyledLinkButton)(({ theme }) => ({
    alignSelf: 'flex-start',
}));

const StyledLogoutButton = styled(Button)(({ theme }) => ({
    width: '100%',
    height: theme.spacing(5),
}));

const StyledDivider = styled('div')(({ theme }) => ({
    width: '100%',
    height: '1px',
    backgroundColor: theme.palette.divider,
    margin: theme.spacing(3, 0),
}));

interface IUserProfileContentProps {
    id: string;
    showProfile: boolean;
    profile: IUser;
}

export const UserProfileContent = ({
    id,
    showProfile,
    profile,
}: IUserProfileContentProps) => (
    <ConditionallyRender
        condition={showProfile}
        show={
            <StyledPaper id={id}>
                <StyledProfileInfo>
                    <StyledUserAvatar user={profile} />
                    <div>
                        <Typography>
                            {profile.name || profile.username}
                        </Typography>
                        <StyledSubtitle variant="body2">
                            {profile.email}
                        </StyledSubtitle>
                    </div>
                </StyledProfileInfo>

                <StyledLinkButton component={Link} to={'/profile'}>
                    View profile settings
                </StyledLinkButton>

                <StyledDivider />

                <StyledLinkPrivacyButton
                    component="a"
                    href="https://www.getunleash.io/privacy-policy"
                    rel="noopener noreferrer"
                    target="_blank"
                    endIcon={<OpenInNew />}
                >
                    Privacy Policy
                </StyledLinkPrivacyButton>

                <StyledDivider />

                <StyledLogoutButton
                    variant="outlined"
                    color="primary"
                    href={`${basePath}/logout`}
                >
                    Logout
                </StyledLogoutButton>
            </StyledPaper>
        }
    />
);
