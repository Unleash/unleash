import { Divider, Drawer, List } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import GitHubIcon from '@material-ui/icons/GitHub';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';

import styles from './drawer.module.scss';

import { baseRoutes as routes } from './routes';

import { ReactComponent as LogoIcon } from '../../assets/icons/logo_wbg.svg';

const filterByFlags = flags => r => {
    if (r.flag && !flags[r.flag]) {
        return false;
    }
    return true;
};

function getIcon(IconComponent) {
    if (IconComponent === 'c_github') {
        return <GitHubIcon className={classnames(styles.navigationIcon)} />;
    } else if (IconComponent === 'library_books') {
        return <LibraryBooksIcon className={styles.navigationIcon} />;
    } else {
        return <IconComponent className={styles.navigationIcon} />;
    }
}

function renderLink(link, toggleDrawer) {
    if (link.path) {
        return (
            <NavLink
                onClick={() => toggleDrawer()}
                key={link.path}
                to={link.path}
                className={classnames(styles.navigationLink)}
                activeClassName={classnames(styles.navigationLinkActive)}
            >
                {getIcon(link.icon)} {link.value}
            </NavLink>
        );
    } else {
        return (
            <a
                href={link.href}
                key={link.href}
                target="_blank"
                className={[styles.navigationLink].join(' ')}
                title={link.title}
                rel="noreferrer"
            >
                {getIcon(link.icon)} {link.value}
            </a>
        );
    }
}

export const DrawerMenu = ({
    links = [],
    title = 'Unleash',
    flags = {},
    open = false,
    toggleDrawer,
}) => (
    <Drawer
        className={styles.drawer}
        open={open}
        anchor={'left'}
        onClose={() => toggleDrawer()}
    >
        <div className={styles.drawerContainer}>
            <div>
                <span className={[styles.drawerTitle].join(' ')}>
                    <LogoIcon className={styles.drawerTitleLogo} />

                    <span className={styles.drawerTitleText}>{title}</span>
                </span>
            </div>
            <Divider />
            <List className={styles.drawerList}>
                {routes.filter(filterByFlags(flags)).map(item => (
                    <NavLink
                        onClick={() => toggleDrawer()}
                        key={item.path}
                        to={item.path}
                        className={classnames(styles.navigationLink)}
                        activeClassName={classnames(
                            styles.navigationLinkActive
                        )}
                    >
                        {getIcon(item.icon)}
                        {item.title}
                    </NavLink>
                ))}
            </List>
            <Divider />
            <List className={styles.navigation}>
                {links.map(l => renderLink(l, toggleDrawer))}
            </List>
        </div>
    </Drawer>
);

DrawerMenu.propTypes = {
    links: PropTypes.array,
    title: PropTypes.string,
    flags: PropTypes.object,
    open: PropTypes.bool,
    toggleDrawer: PropTypes.func,
};
