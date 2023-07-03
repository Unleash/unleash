import { useState, VFC } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import {
    AppBar,
    Container,
    IconButton,
    Tooltip,
    styled,
    Theme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import UserProfile from 'component/user/UserProfile';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/logoWithWhiteText.svg';

import { DrawerMenu } from './DrawerMenu/DrawerMenu';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { flexRow, focusable } from 'themes/themeStyles';
import { NavigationMenu } from './NavigationMenu/NavigationMenu';
import {
    getRoutes,
    adminMenuRoutes,
    getCondensedRoutes,
} from 'component/menu/routes';
import {
    DarkModeOutlined,
    KeyboardArrowDown,
    LightModeOutlined,
} from '@mui/icons-material';
import { filterByConfig } from 'component/common/util';
import { useId } from 'hooks/useId';
import { INavigationMenuItem } from 'interfaces/route';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { useThemeMode } from 'hooks/useThemeMode';
import { Notifications } from 'component/common/Notifications/Notifications';

const StyledHeader = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
    boxShadow: 'none',
    position: 'relative',
    zIndex: 300,
}));

const StyledContainer = styled(Container)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    maxWidth: 1280,
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

const StyledLinks = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    marginLeft: theme.spacing(3),
    '& a': {
        textDecoration: 'none',
        color: 'inherit',
        marginRight: theme.spacing(3),
        display: 'flex',
        alignItems: 'center',
    },
}));

const StyledAdvancedNavButton = styled('button')(({ theme }) => ({
    ...focusable(theme),
    border: 'none',
    background: 'transparent',
    height: '100%',
    display: 'flex',
    fontSize: theme.fontSizes.bodySize,
    fontFamily: theme.typography.fontFamily,
    alignItems: 'center',
    color: 'inherit',
    cursor: 'pointer',
}));

const styledIconProps = (theme: Theme) => ({
    color: theme.palette.neutral.main,
});

const StyledLink = styled(Link)(({ theme }) => focusable(theme));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    ...focusable(theme),
    borderRadius: 100,
}));

const Header: VFC = () => {
    const { onSetThemeMode, themeMode } = useThemeMode();
    const theme = useTheme();
    const adminId = useId();
    const configId = useId();
    const [adminRef, setAdminRef] = useState<HTMLButtonElement | null>(null);
    const [configRef, setConfigRef] = useState<HTMLButtonElement | null>(null);

    const { uiConfig, isOss, isPro, isEnterprise } = useUiConfig();
    const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [openDrawer, setOpenDrawer] = useState(false);

    const toggleDrawer = () => setOpenDrawer(prev => !prev);
    const onAdminClose = () => setAdminRef(null);
    const onConfigureClose = () => setConfigRef(null);

    const routes = getRoutes();

    const filterByMode = (route: INavigationMenuItem): boolean => {
        const { mode } = route.menu;
        return (
            !mode ||
            (mode.includes('pro') && isPro()) ||
            (mode.includes('enterprise') && isEnterprise())
        );
    };

    const filteredMainRoutes = {
        mainNavRoutes: getCondensedRoutes(routes.mainNavRoutes)
            .concat([
                {
                    path: '/admin/api',
                    title: 'API access',
                    menu: {},
                },
            ])
            .filter(filterByConfig(uiConfig)),
        mobileRoutes: getCondensedRoutes(routes.mobileRoutes)
            .concat([
                {
                    path: '/admin/api',
                    title: 'API access',
                    menu: {},
                },
            ])
            .filter(filterByConfig(uiConfig)),
        adminRoutes: adminMenuRoutes
            .filter(filterByConfig(uiConfig))
            .filter(filterByMode)
            .map(route => ({
                ...route,
                path: route.path.replace('/*', ''),
            })),
    };

    if (smallScreen) {
        return (
            <StyledHeader position="static">
                <StyledContainer>
                    <Tooltip title="Menu" arrow>
                        <IconButton
                            sx={{ color: theme => theme.palette.text.primary }}
                            onClick={toggleDrawer}
                            aria-controls="header-drawer"
                            aria-expanded={openDrawer}
                            size="large"
                        >
                            <MenuIcon />
                        </IconButton>
                    </Tooltip>
                    <DrawerMenu
                        flags={uiConfig.flags}
                        links={uiConfig.links}
                        open={openDrawer}
                        toggleDrawer={toggleDrawer}
                        routes={filteredMainRoutes}
                    />
                    <StyledUserContainer>
                        <UserProfile />
                    </StyledUserContainer>
                </StyledContainer>
            </StyledHeader>
        );
    }

    return (
        <StyledHeader position="static">
            <StyledContainer>
                <StyledLink to="/" sx={flexRow} aria-label="Home">
                    <ThemeMode
                        darkmode={
                            <StyledUnleashLogoWhite aria-label="Unleash logo" />
                        }
                        lightmode={
                            <StyledUnleashLogo aria-label="Unleash logo" />
                        }
                    />
                </StyledLink>

                <StyledNav>
                    <StyledLinks>
                        <StyledLink to="/projects">Projects</StyledLink>
                        <StyledLink to="/features">Feature toggles</StyledLink>
                        <StyledLink to="/playground">Playground</StyledLink>
                        <StyledAdvancedNavButton
                            onClick={e => setConfigRef(e.currentTarget)}
                            aria-controls={configRef ? configId : undefined}
                            aria-expanded={Boolean(configRef)}
                        >
                            Configure
                            <KeyboardArrowDown sx={styledIconProps} />
                        </StyledAdvancedNavButton>
                        <NavigationMenu
                            id={configId}
                            options={filteredMainRoutes.mainNavRoutes}
                            anchorEl={configRef}
                            handleClose={onConfigureClose}
                            style={{ top: 10 }}
                        />
                    </StyledLinks>
                    <StyledUserContainer>
                        <Tooltip
                            title={
                                themeMode === 'dark'
                                    ? 'Switch to light theme'
                                    : 'Switch to dark theme'
                            }
                            arrow
                        >
                            <IconButton onClick={onSetThemeMode} sx={focusable}>
                                <ConditionallyRender
                                    condition={themeMode === 'dark'}
                                    show={<DarkModeOutlined />}
                                    elseShow={<LightModeOutlined />}
                                />
                            </IconButton>
                        </Tooltip>{' '}
                        <ConditionallyRender
                            condition={
                                !isOss() &&
                                !uiConfig?.flags.disableNotifications
                            }
                            show={<Notifications />}
                        />
                        <Tooltip title="Documentation" arrow>
                            <IconButton
                                href="https://docs.getunleash.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                size="large"
                                disableRipple
                                sx={focusable}
                            >
                                <MenuBookIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Settings" arrow>
                            <StyledIconButton
                                onClick={e => setAdminRef(e.currentTarget)}
                                aria-controls={adminRef ? adminId : undefined}
                                aria-expanded={Boolean(adminRef)}
                                size="large"
                                disableRipple
                            >
                                <SettingsIcon />
                                <KeyboardArrowDown sx={styledIconProps} />
                            </StyledIconButton>
                        </Tooltip>
                        <NavigationMenu
                            id={adminId}
                            options={filteredMainRoutes.adminRoutes}
                            anchorEl={adminRef}
                            handleClose={onAdminClose}
                            style={{ top: 5, left: -100 }}
                        />{' '}
                        <UserProfile />
                    </StyledUserContainer>
                </StyledNav>
            </StyledContainer>
        </StyledHeader>
    );
};

export default Header;
