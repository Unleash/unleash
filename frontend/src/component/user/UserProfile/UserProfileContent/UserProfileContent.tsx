import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Button, Link, Paper, Typography, styled } from '@mui/material';
import { basePath } from 'utils/formatPath';
import type { IUser } from 'interfaces/user';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

const StyledPaper = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusMedium,
    boxShadow: theme.boxShadows.popup,
    position: 'absolute',
    zIndex: 5000,
    minWidth: theme.spacing(34),
    right: 0,
    marginTop: theme.spacing(0.25),
    [theme.breakpoints.down('md')]: {
        width: '100%',
        padding: '1rem',
    },
}));

const StyledProfileHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: theme.spacing(1),
}));

const StyledAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(7),
    height: theme.spacing(7),
}));

const StyledName = styled(Typography)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledEmail = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
}));

const StyledPrimaryAction = styled(Button)(({ theme }) => ({
    width: '100%',
    height: theme.spacing(5),
}));

const StyledLink = styled(Link<typeof RouterLink | 'a'>)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    padding: 0,
    color: theme.palette.links,
    fontWeight: theme.fontWeight.medium,
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
    '& svg': {
        fontSize: theme.spacing(2.25),
    },
}));

const StyledLogoutButton = styled(Button)(({ theme }) => ({
    width: '100%',
    height: theme.spacing(5),
}));

const StyledDivider = styled('div')(({ theme }) => ({
    width: '100%',
    height: '1px',
    backgroundColor: theme.palette.divider,
    margin: theme.spacing(2.5, 0),
}));

interface IUserProfileContentProps {
    id: string;
    showProfile: boolean;
    setShowProfile: (showProfile: boolean) => void;
    profile: IUser;
}

export const UserProfileContent = ({
    id,
    showProfile,
    setShowProfile,
    profile,
}: IUserProfileContentProps) => (
    <ConditionallyRender
        condition={showProfile}
        show={
            <StyledPaper className='dropdown-outline' id={id}>
                <StyledProfileHeader>
                    <StyledAvatar user={profile} />
                    <div>
                        <StyledName variant='body1'>
                            {profile.name || profile.username}
                        </StyledName>
                        <StyledEmail variant='body2' title={profile.email}>
                            {profile.email}
                        </StyledEmail>
                    </div>
                </StyledProfileHeader>

                <StyledDivider />

                <StyledPrimaryAction
                    component={RouterLink}
                    to='/profile'
                    variant='contained'
                    color='primary'
                    onClick={() => setShowProfile(false)}
                >
                    View profile settings
                </StyledPrimaryAction>

                <StyledDivider />

                <StyledLink
                    component='a'
                    href='https://www.getunleash.io/privacy-policy'
                    underline='hover'
                    rel='noopener noreferrer'
                    target='_blank'
                >
                    Privacy Policy <OpenInNew />
                </StyledLink>

                <StyledDivider />

                <form method='POST' action={`${basePath}/logout`}>
                    <StyledLogoutButton
                        type='submit'
                        variant='outlined'
                        color='primary'
                    >
                        Log out
                    </StyledLogoutButton>
                </form>
            </StyledPaper>
        }
    />
);
