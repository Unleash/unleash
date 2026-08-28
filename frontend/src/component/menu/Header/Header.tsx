import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
    AppBar,
    Box,
    Divider,
    IconButton,
    styled,
    Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import UserProfile from 'component/user/UserProfile';
import { DrawerMenu } from './DrawerMenu/DrawerMenu.tsx';
import InviteLinkButton from './InviteLink/InviteLinkButton/InviteLinkButton.tsx';
import { CommandBar } from 'component/commandBar/CommandBar';
import { HelpResources } from './HelpResources/HelpResources';
import { SearchDocsButton } from './SearchDocs/SearchDocsButton.tsx';
import { PendingAccessRequestsIndicator } from 'component/admin/users/AccessRequestsNotifications/PendingAccessRequestsIndicator';
import { Link } from 'react-router';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import UnleashLogo from 'assets/img/logoDarkWithText.svg?react';
import UnleashLogoWhite from 'assets/img/logoWithWhiteText.svg?react';

const HeaderComponent = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.background.application,
    padding: theme.spacing(1),
    boxShadow: 'none',
    position: 'relative',
    paddingRight: theme.spacing(9),
    [theme.breakpoints.down('lg')]: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    [theme.breakpoints.down(1024)]: {
        marginLeft: 0,
        marginRight: 0,
    },
    [theme.breakpoints.down('sm')]: {
        minWidth: '100%',
    },
    margin: '0 auto',
}));

const ContainerComponent = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    '&&&': { padding: 0 },
}));

const StyledUserContainer = styled('div')({
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
});

const StyledNav = styled('nav')({
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
});

const StyledLogoLink = styled(Link)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: theme.spacing(1),
}));

const StyledUnleashLogo = styled(UnleashLogo)({ width: '120px' });

const StyledUnleashLogoWhite = styled(UnleashLogoWhite)({ width: '120px' });

const Header = () => {
    const theme = useTheme();
    const mediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const [openDrawer, setOpenDrawer] = useState(false);
    const toggleDrawer = () => setOpenDrawer((prev) => !prev);

    const headerItems = (
        <StyledUserContainer>
            <CommandBar />
            <SearchDocsButton />
            <Divider
                orientation='vertical'
                variant='middle'
                flexItem
                sx={(theme) => ({
                    marginLeft: theme.spacing(1),
                    border: 'transparent',
                })}
            />
            <InviteLinkButton />
            <HelpResources />
            <Divider
                orientation='vertical'
                variant='middle'
                flexItem
                sx={{ ml: 1 }}
            />
            <UserProfile />
        </StyledUserContainer>
    );

    if (mediumScreen) {
        return (
            <HeaderComponent position='static'>
                <ContainerComponent>
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'inline-flex',
                        }}
                    >
                        <Tooltip title='Menu' arrow>
                            <IconButton
                                sx={{
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                }}
                                onClick={toggleDrawer}
                                aria-controls='header-drawer'
                                aria-expanded={openDrawer}
                                size='large'
                            >
                                <MenuIcon />
                            </IconButton>
                        </Tooltip>
                        <Box
                            sx={(theme) => ({
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                pointerEvents: 'none',
                            })}
                        >
                            <PendingAccessRequestsIndicator
                                showTooltip={false}
                            />
                        </Box>
                    </Box>
                    <StyledLogoLink to='/' aria-label='Home'>
                        <ThemeMode
                            darkmode={
                                <StyledUnleashLogoWhite aria-label='Unleash logo' />
                            }
                            lightmode={
                                <StyledUnleashLogo aria-label='Unleash logo' />
                            }
                        />
                    </StyledLogoLink>
                    <DrawerMenu open={openDrawer} toggleDrawer={toggleDrawer} />
                    {headerItems}
                </ContainerComponent>
            </HeaderComponent>
        );
    }

    return (
        <HeaderComponent position='static'>
            <ContainerComponent>
                <StyledNav>{headerItems}</StyledNav>
            </ContainerComponent>
        </HeaderComponent>
    );
};

export default Header;
