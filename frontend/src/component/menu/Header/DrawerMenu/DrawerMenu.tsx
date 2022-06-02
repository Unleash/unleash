import React, { ReactNode, VFC } from 'react';
import { Link } from 'react-router-dom';
import { Divider, Drawer, List } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ExitToApp from '@mui/icons-material/ExitToApp';
import { ReactComponent as LogoIcon } from 'assets/icons/logoBg.svg';
import NavigationLink from '../NavigationLink/NavigationLink';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { basePath } from 'utils/formatPath';
import { IFlags } from 'interfaces/uiConfig';
import { IRoute } from 'interfaces/route';
import styles from './DrawerMenu.module.scss'; // FIXME: useStyle - theme

interface IDrawerMenuProps {
    title?: string;
    open?: boolean;
    toggleDrawer: () => void;
    admin?: boolean;
    links: Array<{
        value: string;
        icon: ReactNode;
        href: string;
        title: string;
    }>;
    flags?: IFlags;
    routes: {
        mainNavRoutes: IRoute[];
        mobileRoutes: IRoute[];
        adminRoutes: IRoute[];
    };
}

export const DrawerMenu: VFC<IDrawerMenuProps> = ({
    links = [],
    title = 'Unleash',
    flags = {},
    open = false,
    toggleDrawer,
    admin = false,
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
        >
            <nav id="header-drawer" className={styles.drawerContainer}>
                <div>
                    <Link
                        to="/"
                        className={styles.drawerTitle}
                        aria-label="Home"
                        onClick={() => toggleDrawer()}
                    >
                        <LogoIcon
                            className={styles.drawerTitleLogo}
                            aria-label="Unleash logo"
                        />
                        <span className={styles.drawerTitleText}>{title}</span>
                    </Link>
                </div>
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
                <ConditionallyRender
                    condition={admin}
                    show={
                        <>
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
                        </>
                    }
                />
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
