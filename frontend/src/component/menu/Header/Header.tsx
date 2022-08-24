import { useEffect, useState, VFC } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import {
    AppBar,
    Container,
    FormControlLabel,
    IconButton,
    Tooltip,
    Switch,
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
import { useThemeStyles } from 'themes/themeStyles';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { IPermission } from 'interfaces/user';
import { NavigationMenu } from './NavigationMenu/NavigationMenu';
import { getRoutes } from 'component/menu/routes';
import { KeyboardArrowDown } from '@mui/icons-material';
import { filterByConfig } from 'component/common/util';
import { useAuthPermissions } from 'hooks/api/getters/useAuth/useAuthPermissions';
import { useStyles } from './Header.styles';
import classNames from 'classnames';
import { useId } from 'hooks/useId';
import { IRoute } from 'interfaces/route';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { useThemeMode } from 'hooks/useThemeMode';

const Header: VFC = () => {
    const { onSetThemeMode, themeMode } = useThemeMode();
    const theme = useTheme();
    const adminId = useId();
    const configId = useId();
    const [adminRef, setAdminRef] = useState<HTMLButtonElement | null>(null);
    const [configRef, setConfigRef] = useState<HTMLButtonElement | null>(null);

    const [admin, setAdmin] = useState(false);
    const { permissions } = useAuthPermissions();
    const { uiConfig, isOss } = useUiConfig();
    const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { classes: styles } = useStyles();
    const { classes: themeStyles } = useThemeStyles();
    const [openDrawer, setOpenDrawer] = useState(false);

    const toggleDrawer = () => setOpenDrawer(prev => !prev);
    const onAdminClose = () => setAdminRef(null);
    const onConfigureClose = () => setConfigRef(null);

    useEffect(() => {
        const admin = permissions?.find(
            (element: IPermission) => element.permission === ADMIN
        );

        if (admin) {
            setAdmin(true);
        }
    }, [permissions]);

    const routes = getRoutes();

    const filterByEnterprise = (route: IRoute): boolean => {
        return !route.menu.isEnterprise || !isOss();
    };

    const filteredMainRoutes = {
        mainNavRoutes: routes.mainNavRoutes.filter(filterByConfig(uiConfig)),
        mobileRoutes: routes.mobileRoutes.filter(filterByConfig(uiConfig)),
        adminRoutes: routes.adminRoutes
            .filter(filterByConfig(uiConfig))
            .filter(filterByEnterprise),
    };

    if (smallScreen) {
        return (
            <AppBar className={styles.header} position="static">
                <Container className={styles.container}>
                    <Tooltip title="Menu" arrow>
                        <IconButton
                            className={styles.drawerButton}
                            onClick={toggleDrawer}
                            aria-controls="header-drawer"
                            aria-expanded={openDrawer}
                            size="large"
                        >
                            <MenuIcon />
                        </IconButton>
                    </Tooltip>
                    <DrawerMenu
                        title={uiConfig.name}
                        flags={uiConfig.flags}
                        links={uiConfig.links}
                        open={openDrawer}
                        toggleDrawer={toggleDrawer}
                        admin={admin}
                        routes={filteredMainRoutes}
                    />
                    <div className={styles.userContainer}>
                        <UserProfile />
                    </div>
                </Container>
            </AppBar>
        );
    }

    return (
        <AppBar className={styles.header} position="static">
            <Container className={styles.container}>
                <Link
                    to="/"
                    className={classNames(
                        themeStyles.flexRow,
                        themeStyles.focusable
                    )}
                    aria-label="Home"
                >
                    <ThemeMode
                        darkmode={
                            <UnleashLogoWhite
                                className={styles.logo}
                                aria-label="Unleash logo"
                            />
                        }
                        lightmode={
                            <UnleashLogo
                                className={styles.logo}
                                aria-label="Unleash logo"
                            />
                        }
                    />
                </Link>
                <nav className={styles.nav}>
                    <div className={styles.links}>
                        <Link to="/projects" className={themeStyles.focusable}>
                            Projects
                        </Link>
                        <Link to="/features" className={themeStyles.focusable}>
                            Feature toggles
                        </Link>
                        <Link
                            to="/playground"
                            className={themeStyles.focusable}
                        >
                            Playground
                        </Link>
                        <button
                            className={styles.advancedNavButton}
                            onClick={e => setConfigRef(e.currentTarget)}
                            aria-controls={configRef ? configId : undefined}
                            aria-expanded={Boolean(configRef)}
                        >
                            Configure
                            <KeyboardArrowDown className={styles.icon} />
                        </button>
                        <NavigationMenu
                            id={configId}
                            options={filteredMainRoutes.mainNavRoutes}
                            anchorEl={configRef}
                            handleClose={onConfigureClose}
                            style={{ top: 10 }}
                        />
                    </div>
                    <div className={styles.userContainer}>
                        <ConditionallyRender
                            condition={Boolean(
                                uiConfig.flags.ENABLE_DARK_MODE_SUPPORT
                            )}
                            show={
                                <FormControlLabel
                                    control={
                                        <Switch
                                            onChange={onSetThemeMode}
                                            checked={themeMode === 'dark'}
                                        />
                                    }
                                    label="darkmode"
                                />
                            }
                        />
                        <Tooltip title="Documentation" arrow>
                            <IconButton
                                href="https://docs.getunleash.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                size="large"
                                disableRipple
                                className={themeStyles.focusable}
                            >
                                <MenuBookIcon />
                            </IconButton>
                        </Tooltip>
                        <ConditionallyRender
                            condition={admin}
                            show={
                                <Tooltip title="Settings" arrow>
                                    <IconButton
                                        onClick={e =>
                                            setAdminRef(e.currentTarget)
                                        }
                                        className={classNames(
                                            styles.wideButton,
                                            themeStyles.focusable
                                        )}
                                        aria-controls={
                                            adminRef ? adminId : undefined
                                        }
                                        aria-expanded={Boolean(adminRef)}
                                        size="large"
                                        disableRipple
                                    >
                                        <SettingsIcon />
                                        <KeyboardArrowDown
                                            className={styles.icon}
                                        />
                                    </IconButton>
                                </Tooltip>
                            }
                        />
                        <NavigationMenu
                            id={adminId}
                            options={filteredMainRoutes.adminRoutes}
                            anchorEl={adminRef}
                            handleClose={onAdminClose}
                            style={{ top: 5, left: -100 }}
                        />{' '}
                        <UserProfile />
                    </div>
                </nav>
            </Container>
        </AppBar>
    );
};

export default Header;
