import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { type Theme, useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
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
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/logoWithWhiteText.svg';

import { DrawerMenu } from './DrawerMenu/DrawerMenu';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { focusable } from 'themes/themeStyles';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { useThemeMode } from 'hooks/useThemeMode';
import { Notifications } from 'component/common/Notifications/Notifications';
import InviteLinkButton from './InviteLink/InviteLinkButton/InviteLinkButton';
import { useUiFlag } from 'hooks/useUiFlag';
import { CommandBar } from 'component/commandBar/CommandBar';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { ReactComponent as CelebratoryUnleashLogo } from 'assets/img/unleashHoliday.svg';
import { ReactComponent as CelebratoryUnleashLogoWhite } from 'assets/img/unleashHolidayDark.svg';
import { useNewAdminMenu } from 'hooks/useNewAdminMenu';

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

const StyledCelebratoryLogo = styled(CelebratoryUnleashLogo)({
    height: '50px',
});

const StyledUnleashLogoWhite = styled(UnleashLogoWhite)({ height: '50px' });

const StyledUnleashLogo = styled(UnleashLogo)({ height: '50px' });

const StyledLink = styled(Link)(({ theme }) => focusable(theme));

const StyledIconButton = styled(IconButton)<{
    component?: 'a' | 'button';
    href?: string;
    target?: string;
}>(({ theme }) => ({
    borderRadius: 100,
    '&:focus-visible': {
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineColor: theme.palette.primary.main,
        borderRadius: '100%',
    },
}));

const Header = () => {
    const { onSetThemeMode, themeMode } = useThemeMode();
    const theme = useTheme();

    const disableNotifications = useUiFlag('disableNotifications');
    const { uiConfig, isOss } = useUiConfig();
    const smallScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const [openDrawer, setOpenDrawer] = useState(false);
    const toggleDrawer = () => setOpenDrawer((prev) => !prev);
    const celebratoryUnleash = useUiFlag('celebrateUnleash');
    const headerLogo = (theme: Theme) => ({
        height: '50px',
        marginLeft: theme.spacing(1.5),
    });
    const adminMenu = useNewAdminMenu();

    if (smallScreen) {
        return (
            <HeaderComponent position='static'>
                <ContainerComponent>
                    <Tooltip title='Menu' arrow>
                        <IconButton
                            sx={{
                                color: (theme) => theme.palette.text.primary,
                            }}
                            onClick={toggleDrawer}
                            aria-controls='header-drawer'
                            aria-expanded={openDrawer}
                            size='large'
                        >
                            <MenuIcon />
                        </IconButton>
                    </Tooltip>
                    <DrawerMenu open={openDrawer} toggleDrawer={toggleDrawer} />
                    <StyledUserContainer>
                        <UserProfile />
                    </StyledUserContainer>
                </ContainerComponent>
            </HeaderComponent>
        );
    }

    return (
        <HeaderComponent position='static'>
            <ContainerComponent>
                <StyledNav>
                    <ConditionallyRender
                        condition={adminMenu}
                        show={
                            <StyledLink
                                to='/personal'
                                sx={headerLogo}
                                aria-label='Home'
                            >
                                <ThemeMode
                                    darkmode={
                                        <ConditionallyRender
                                            condition={celebratoryUnleash}
                                            show={
                                                <CelebratoryUnleashLogoWhite />
                                            }
                                            elseShow={
                                                <StyledUnleashLogoWhite aria-label='Unleash logo' />
                                            }
                                        />
                                    }
                                    lightmode={
                                        <ConditionallyRender
                                            condition={celebratoryUnleash}
                                            show={<StyledCelebratoryLogo />}
                                            elseShow={
                                                <StyledUnleashLogo aria-label='Unleash logo' />
                                            }
                                        />
                                    }
                                />
                            </StyledLink>
                        }
                    />

                    <StyledUserContainer>
                        <CommandBar />
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
                        <Tooltip
                            title={
                                themeMode === 'dark'
                                    ? 'Switch to light theme'
                                    : 'Switch to dark theme'
                            }
                            arrow
                        >
                            <StyledIconButton
                                onClick={onSetThemeMode}
                                size='large'
                            >
                                <ConditionallyRender
                                    condition={themeMode === 'dark'}
                                    show={<DarkModeOutlined />}
                                    elseShow={<LightModeOutlined />}
                                />
                            </StyledIconButton>
                        </Tooltip>
                        <ConditionallyRender
                            condition={!isOss() && !disableNotifications}
                            show={<Notifications />}
                        />
                        <Tooltip title='Documentation' arrow>
                            <StyledIconButton
                                component='a'
                                href='https://docs.getunleash.io/'
                                target='_blank'
                                rel='noopener noreferrer'
                                size='large'
                                sx={(theme) => ({
                                    marginRight: theme.spacing(1),
                                })}
                            >
                                <MenuBookIcon />
                            </StyledIconButton>
                        </Tooltip>
                        <Divider
                            orientation='vertical'
                            variant='middle'
                            flexItem
                            sx={{ ml: 1 }}
                        />
                        <UserProfile />
                    </StyledUserContainer>
                </StyledNav>
            </ContainerComponent>
        </HeaderComponent>
    );
};

export default Header;
