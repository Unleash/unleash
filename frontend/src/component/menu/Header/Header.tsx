import { useEffect, useState, VFC } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { AppBar, Container, IconButton, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import UserProfile from 'component/user/UserProfile';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';

import { DrawerMenu } from './DrawerMenu/DrawerMenu';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useThemeStyles } from 'themes/themeStyles';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { IPermission } from 'interfaces/user';
import { NavigationMenu } from './NavigationMenu/NavigationMenu';
import { getRoutes } from 'component/menu/routes';
import { KeyboardArrowDown } from '@mui/icons-material';
import { filterByFlags } from 'component/common/util';
import { useAuthPermissions } from 'hooks/api/getters/useAuth/useAuthPermissions';
import { useStyles } from './Header.styles';
import classNames from 'classnames';

const Header: VFC = () => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [anchorElAdvanced, setAnchorElAdvanced] =
        useState<HTMLButtonElement | null>(null);

    const [admin, setAdmin] = useState(false);
    const { permissions } = useAuthPermissions();
    const {
        uiConfig: { links, name, flags },
    } = useUiConfig();
    const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { classes: styles } = useStyles();
    const { classes: themeStyles } = useThemeStyles();
    const [openDrawer, setOpenDrawer] = useState(false);

    const toggleDrawer = () => setOpenDrawer(prev => !prev);
    const handleClose = () => setAnchorEl(null);
    const handleCloseAdvanced = () => setAnchorElAdvanced(null);

    useEffect(() => {
        const admin = permissions?.find(
            (element: IPermission) => element.permission === ADMIN
        );

        if (admin) {
            setAdmin(true);
        }
    }, [permissions]);

    const routes = getRoutes();

    const filteredMainRoutes = {
        mainNavRoutes: routes.mainNavRoutes.filter(filterByFlags(flags)),
        mobileRoutes: routes.mobileRoutes.filter(filterByFlags(flags)),
        adminRoutes: routes.adminRoutes.filter(filterByFlags(flags)),
    };

    if (smallScreen) {
        return (
            <AppBar className={styles.header} position="static">
                <Container className={styles.container}>
                    <Tooltip title="Menu">
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
                        title={name}
                        flags={flags}
                        links={links}
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
                    <UnleashLogo
                        className={styles.logo}
                        aria-label="Unleash logo"
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
                        <button
                            className={styles.advancedNavButton}
                            onClick={e => setAnchorElAdvanced(e.currentTarget)}
                        >
                            Configure
                            <KeyboardArrowDown className={styles.icon} />
                        </button>
                        <NavigationMenu
                            id="settings-navigation"
                            options={filteredMainRoutes.mainNavRoutes}
                            anchorEl={anchorElAdvanced}
                            handleClose={handleCloseAdvanced}
                            style={{ top: 10 }}
                        />
                    </div>
                    <div className={styles.userContainer}>
                        <Tooltip title="Documentation">
                            <IconButton
                                href="https://docs.getunleash.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                size="large"
                                disableRipple
                                className={themeStyles.focusable}
                            >
                                <MenuBookIcon className={styles.icon} />
                            </IconButton>
                        </Tooltip>
                        <ConditionallyRender
                            condition={admin}
                            show={
                                <Tooltip title="Settings">
                                    <IconButton
                                        onClick={e =>
                                            setAnchorEl(e.currentTarget)
                                        }
                                        className={classNames(
                                            styles.wideButton,
                                            themeStyles.focusable
                                        )}
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
                            id="admin-navigation"
                            options={filteredMainRoutes.adminRoutes}
                            anchorEl={anchorEl}
                            handleClose={handleClose}
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
