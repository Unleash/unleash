import { useState, type VFC } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
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
import { ReactComponent as CelebatoryUnleashLogo } from 'assets/img/unleashHoliday.svg';
import { ReactComponent as CelebatoryUnleashLogoWhite } from 'assets/img/unleashHolidayDark.svg';

import { DrawerMenu } from './DrawerMenu/DrawerMenu';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { flexRow, focusable } from 'themes/themeStyles';
import { getCondensedRoutes, getRoutes } from 'component/menu/routes';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { filterByConfig, mapRouteLink } from 'component/common/util';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { useThemeMode } from 'hooks/useThemeMode';
import { Notifications } from 'component/common/Notifications/Notifications';
import { useAdminRoutes } from 'component/admin/useAdminRoutes';
import InviteLinkButton from './InviteLink/InviteLinkButton/InviteLinkButton';
import { useUiFlag } from 'hooks/useUiFlag';
import { CommandBar } from 'component/commandBar/CommandBar';

const HeaderComponent = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
    boxShadow: 'none',
    position: 'relative',
    zIndex: 300,
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

const StyledUnleashLogoWhite = styled(UnleashLogoWhite)({ width: '150px' });

const StyledUnleashLogo = styled(UnleashLogo)({ width: '150px' });

const StyledCelebatoryLogo = styled(CelebatoryUnleashLogo)({ width: '150px' });

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

const Header: VFC = () => {
    const { onSetThemeMode, themeMode } = useThemeMode();
    const theme = useTheme();

    const disableNotifications = useUiFlag('disableNotifications');
    const { uiConfig, isOss } = useUiConfig();
    const smallScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const [openDrawer, setOpenDrawer] = useState(false);
    const toggleDrawer = () => setOpenDrawer((prev) => !prev);
    const celebatoryUnleash = useUiFlag('celebrateUnleash');

    const routes = getRoutes();
    const adminRoutes = useAdminRoutes();

    const filteredMainRoutes = {
        mainNavRoutes: getCondensedRoutes(routes.mainNavRoutes)
            .filter(filterByConfig(uiConfig))
            .map(mapRouteLink),
        mobileRoutes: getCondensedRoutes(routes.mobileRoutes)
            .filter(filterByConfig(uiConfig))
            .map(mapRouteLink),
        adminRoutes,
    };

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
                    <DrawerMenu
                        links={uiConfig.links}
                        open={openDrawer}
                        toggleDrawer={toggleDrawer}
                        routes={filteredMainRoutes}
                    />
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
                <StyledLink to='/' sx={flexRow} aria-label='Home'>
                    <ThemeMode
                        darkmode={
                            <ConditionallyRender
                                condition={celebatoryUnleash}
                                show={<CelebatoryUnleashLogoWhite />}
                                elseShow={
                                    <StyledUnleashLogoWhite aria-label='Unleash logo' />
                                }
                            />
                        }
                        lightmode={
                            <ConditionallyRender
                                condition={celebatoryUnleash}
                                show={<StyledCelebatoryLogo />}
                                elseShow={
                                    <StyledUnleashLogo aria-label='Unleash logo' />
                                }
                            />
                        }
                    />
                </StyledLink>

                <StyledNav>
                    <StyledUserContainer>
                        <CommandBar />
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
                                sx={{ mr: 1 }}
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
