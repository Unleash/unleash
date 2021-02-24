import React from 'react';
import { Drawer, Icon, Navigation } from 'react-mdl';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../styles.module.scss';

import { baseRoutes as routes } from './routes';

const filterByFlags = flags => r => {
    if (r.flag && !flags[r.flag]) {
        return false;
    }
    return true;
};

function getIcon(name) {
    if (name === 'c_github') {
        return <i className={['material-icons', styles.navigationIcon, styles.iconGitHub].join(' ')} />;
    } else {
        return <Icon name={name} className={styles.navigationIcon} />;
    }
}

function renderLink(link) {
    if (link.path) {
        return (
            <NavLink
                key={link.path}
                to={link.path}
                className={[styles.navigationLink, 'mdl-color-text--grey-900'].join(' ')}
                activeClassName={[styles.navigationLink, 'mdl-color-text--black', 'mdl-color--blue-grey-100'].join(' ')}
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
                className={[styles.navigationLink, 'mdl-color-text--grey-900'].join(' ')}
                title={link.title}
            >
                {getIcon(link.icon)} {link.value}
            </a>
        );
    }
}

export const DrawerMenu = ({ links = [], title = 'Unleash', flags = {} }) => (
    <Drawer style={{ boxShadow: 'none', border: 0 }}>
        <span className={[styles.drawerTitle, 'mdl-layout-title'].join(' ')}>
            <img src="public/logo.png" width="32" height="32" className={styles.drawerTitleLogo} />
            <span className={styles.drawerTitleText}>{title}</span>
        </span>
        <hr />
        <Navigation className={styles.navigation}>
            {routes.filter(filterByFlags(flags)).map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={[styles.navigationLink, 'mdl-color-text--grey-900'].join(' ')}
                    activeClassName={[styles.navigationLink, 'mdl-color-text--black', 'mdl-color--blue-grey-50'].join(
                        ' '
                    )}
                >
                    <Icon name={item.icon} className={styles.navigationIcon} /> {item.title}
                </NavLink>
            ))}
        </Navigation>
        <hr />
        <Navigation className={styles.navigation}>{links.map(renderLink)}</Navigation>
    </Drawer>
);

DrawerMenu.propTypes = {
    links: PropTypes.array,
    title: PropTypes.string,
    flags: PropTypes.object,
};
