import type { ReactNode, VFC } from 'react';
import { Link } from 'react-router-dom';
import { Divider, Drawer, styled } from '@mui/material';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/logoWithWhiteText.svg';
import type { INavigationMenuItem } from 'interfaces/route';
import styles from './DrawerMenu.module.scss'; // FIXME: useStyle - theme
import theme from 'themes/theme';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { MobileNavigationSidebar } from 'component/layout/MainLayout/NavigationSidebar/NavigationSidebar';
import { NewInUnleash } from 'component/layout/MainLayout/NavigationSidebar/NewInUnleash/NewInUnleash';

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
    routes: {
        mainNavRoutes: INavigationMenuItem[];
        mobileRoutes: INavigationMenuItem[];
        adminRoutes: INavigationMenuItem[];
    };
}

export const DrawerMenu: VFC<IDrawerMenuProps> = ({
    links = [],
    open = false,
    toggleDrawer,
    routes,
}) => {
    return (
        <Drawer
            className={styles.drawer}
            open={open}
            anchor='left'
            onClose={toggleDrawer}
            style={{ zIndex: theme.zIndex.snackbar + 1 }}
        >
            <nav id='header-drawer' className={styles.drawerContainer}>
                <StyledDrawerHeader>
                    <Link
                        to='/'
                        className={styles.drawerTitle}
                        aria-label='Home'
                        onClick={() => toggleDrawer()}
                    >
                        <ThemeMode
                            darkmode={
                                <UnleashLogoWhite aria-label='Unleash logo' />
                            }
                            lightmode={
                                <UnleashLogo aria-label='Unleash logo' />
                            }
                        />
                    </Link>
                </StyledDrawerHeader>
                <Divider />
                <MobileNavigationSidebar
                    onClick={toggleDrawer}
                    NewInUnleash={NewInUnleash}
                />
            </nav>
        </Drawer>
    );
};
