import React from 'react';
import { Divider, Drawer, List, Icon } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import styles from './drawer.module.scss';

import { baseRoutes as routes } from './routes';

const filterByFlags = flags => r => {
    if (r.flag && !flags[r.flag]) {
        return false;
    }
    return true;
};

function getIcon(name) {
    if (name === 'c_github') {
        return <i className={classnames('material-icons', styles.navigationIcon, styles.iconGitHub)} />;
    } else {
        return <Icon className={styles.navigationIcon}>{name}</Icon>;
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
                title={link.title} rel="noreferrer"
            >
                {getIcon(link.icon)} {link.value}
            </a>
        );
    }
}

export const DrawerMenu = ({ links = [], title = 'Unleash', flags = {}, open = false, toggleDrawer }) => (
    <Drawer className={styles.drawer} open={open} anchor={'left'} onClose={() => toggleDrawer()}>
        <div className={styles.drawerContainer}>
            <div className={styles.drawerTitleContainer}>
                <span className={[styles.drawerTitle].join(' ')}>
                    <img alt="Unleash Logo" src="logo.png" width="32" height="32" className={styles.drawerTitleLogo} />
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
                        activeClassName={classnames(styles.navigationLinkActive)}
                    >
                        {getIcon(item.icon)}
                        {item.title}
                    </NavLink>
                ))}
            </List>
            <Divider />
            <List className={styles.navigation}>{links.map(l => renderLink(l, toggleDrawer))}</List>
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
