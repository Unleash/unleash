import { useEffect, useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { AppBar, Container, IconButton, Tooltip } from '@material-ui/core';
import { DrawerMenu } from '../drawer';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import UserProfile from '../../user/UserProfile';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import { ReactComponent as UnleashLogo } from '../../../assets/img/logo-dark-with-text.svg';

import { useStyles } from './Header.styles';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';
import { useCommonStyles } from '../../../common.styles';
import { ADMIN } from '../../providers/AccessProvider/permissions';
import { IPermission } from '../../../interfaces/user';
import NavigationMenu from './NavigationMenu/NavigationMenu';
import { getRoutes } from '../routes';
import { KeyboardArrowDown } from '@material-ui/icons';
import { filterByFlags } from '../../common/util';
import { useAuthPermissions } from '../../../hooks/api/getters/useAuth/useAuthPermissions';

const Header = () => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState();
    const [anchorElAdvanced, setAnchorElAdvanced] = useState();
    const [admin, setAdmin] = useState(false);
    const { permissions } = useAuthPermissions();
    const commonStyles = useCommonStyles();
    const { uiConfig } = useUiConfig();
    const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const styles = useStyles();
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

    const { links, name, flags } = uiConfig;
    const routes = getRoutes();

    const filteredMainRoutes = {
        mainNavRoutes: routes.mainNavRoutes.filter(filterByFlags(flags)),
        mobileRoutes: routes.mobileRoutes.filter(filterByFlags(flags)),
        adminRoutes: routes.adminRoutes.filter(filterByFlags(flags)),
    };

    return (
        <>
            <AppBar className={styles.header} position="static">
                <Container className={styles.container}>
                    <ConditionallyRender
                        condition={smallScreen}
                        show={
                            <IconButton
                                className={styles.drawerButton}
                                onClick={toggleDrawer}
                            >
                                <MenuIcon titleAccess="Menu" />
                            </IconButton>
                        }
                        elseShow={
                            <Link
                                to="/"
                                className={commonStyles.flexRow}
                                aria-label="Home"
                            >
                                <UnleashLogo
                                    className={styles.logo}
                                    aria-label="Unleash logo"
                                />
                            </Link>
                        }
                    />

                    <DrawerMenu
                        title={name}
                        flags={flags}
                        links={links}
                        open={openDrawer}
                        toggleDrawer={toggleDrawer}
                        admin={admin}
                        routes={filteredMainRoutes}
                    />
                    <ConditionallyRender
                        condition={!smallScreen}
                        show={
                            <div className={styles.links}>
                                <Link to="/projects">Projects</Link>
                                <Link to="/features">Feature toggles</Link>

                                <button
                                    className={styles.advancedNavButton}
                                    onClick={e =>
                                        setAnchorElAdvanced(e.currentTarget)
                                    }
                                >
                                    Configure
                                    <KeyboardArrowDown />
                                </button>
                                <NavigationMenu
                                    id="settings-navigation"
                                    options={filteredMainRoutes.mainNavRoutes}
                                    anchorEl={anchorElAdvanced}
                                    handleClose={handleCloseAdvanced}
                                    style={{ top: '30px', left: '-55px' }}
                                />
                            </div>
                        }
                    />
                    <div className={styles.userContainer}>
                        <ConditionallyRender
                            condition={!smallScreen}
                            show={
                                <>
                                    <Tooltip title="Go to the documentation">
                                        <a
                                            href="https://docs.getunleash.io/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.docsLink}
                                        >
                                            <MenuBookIcon
                                                className={styles.docsIcon}
                                                titleAccess="Documentation"
                                            />
                                        </a>
                                    </Tooltip>
                                    <ConditionallyRender
                                        condition={admin}
                                        show={
                                            <IconButton
                                                onClick={e =>
                                                    setAnchorEl(e.currentTarget)
                                                }
                                            >
                                                <SettingsIcon
                                                    className={styles.docsIcon}
                                                    titleAccess="Settings"
                                                />
                                            </IconButton>
                                        }
                                    />

                                    <NavigationMenu
                                        id="admin-navigation"
                                        options={filteredMainRoutes.adminRoutes}
                                        anchorEl={anchorEl}
                                        handleClose={handleClose}
                                        style={{ top: '40px', left: '-125px' }}
                                    />
                                </>
                            }
                        />

                        <UserProfile />
                    </div>
                </Container>
            </AppBar>
        </>
    );
};

export default Header;
