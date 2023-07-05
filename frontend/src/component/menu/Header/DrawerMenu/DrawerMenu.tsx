import { ReactNode, VFC } from 'react';
import { Link } from 'react-router-dom';
import { Divider, Drawer, List, styled } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ExitToApp from '@mui/icons-material/ExitToApp';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/logoWithWhiteText.svg';
import NavigationLink from '../NavigationLink/NavigationLink';
import { basePath } from 'utils/formatPath';
import { IFlags } from 'interfaces/uiConfig';
import { INavigationMenuItem } from 'interfaces/route';
import styles from './DrawerMenu.module.scss'; // FIXME: useStyle - theme
import theme from 'themes/theme';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';

const StyledDrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'start',
    '& svg': {
        width: '100%',
        height: '100%',
        maxHeight: theme.spacing(8),
        padding: theme.spacing(0.5),
    },
}));

interface IDrawerMenuProps {
    title?: string;
    open?: boolean;
    toggleDrawer: () => void;
    links: Array<{
        value: string;
        icon: ReactNode;
        href: string;
        title: string;
    }>;
    flags?: IFlags;
    routes: {
        mainNavRoutes: INavigationMenuItem[];
        mobileRoutes: INavigationMenuItem[];
        adminRoutes: INavigationMenuItem[];
    };
}

export const DrawerMenu: VFC<IDrawerMenuProps> = ({
    links = [],
    flags = {},
    open = false,
    toggleDrawer,
    routes,
}) => {
    const renderLinks = () => {
        return links.map(link => {
            let icon = null;
            if (link.value === 'GitHub') {
                icon = <GitHubIcon className={styles.navigationIcon} />;
            } else if (link.value === 'Documentation') {
                icon = <LibraryBooksIcon className={styles.navigationIcon} />;
            }

            return (
                <a
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className={styles.iconLink}
                    key={link.value}
                >
                    {icon}
                    {link.value}
                </a>
            );
        });
    };

    return (
        <Drawer
            className={styles.drawer}
            open={open}
            anchor="left"
            onClose={toggleDrawer}
            style={{ zIndex: theme.zIndex.snackbar + 1 }}
        >
            <nav id="header-drawer" className={styles.drawerContainer}>
                <StyledDrawerHeader>
                    <Link
                        to="/"
                        className={styles.drawerTitle}
                        aria-label="Home"
                        onClick={() => toggleDrawer()}
                    >
                        <ThemeMode
                            darkmode={
                                <UnleashLogoWhite aria-label="Unleash logo" />
                            }
                            lightmode={
                                <UnleashLogo aria-label="Unleash logo" />
                            }
                        />
                    </Link>
                </StyledDrawerHeader>
                <Divider />
                <List className={styles.drawerList}>
                    {routes.mobileRoutes.map(item => (
                        <NavigationLink
                            handleClose={() => toggleDrawer()}
                            path={item.path}
                            text={item.title}
                            key={item.path}
                        />
                    ))}
                </List>
                <Divider />

                <List className={styles.drawerList}>
                    {routes.adminRoutes.map(item => (
                        <NavigationLink
                            handleClose={() => toggleDrawer()}
                            path={item.path}
                            text={item.title}
                            key={item.path}
                        />
                    ))}
                </List>
                <Divider />
                <div className={styles.iconLinkList}>
                    {renderLinks()}
                    <a className={styles.iconLink} href={`${basePath}/logout`}>
                        <ExitToApp className={styles.navigationIcon} />
                        Sign out
                    </a>
                </div>
            </nav>
        </Drawer>
    );
};
