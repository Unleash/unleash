import React from 'react';
import { Drawer, Icon, Navigation } from 'react-mdl';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../styles.scss';

import { baseRoutes as routes } from './routes';

function getIcon(name) {
    if (name === 'c_github') {
        return <i className={['material-icons', styles.navigationIcon, styles.iconGitHub].join(' ')} />;
    } else {
        return <Icon name={name} className={styles.navigationIcon} />;
    }
}

export const DrawerMenu = ({ links = [] }) => (
    <Drawer className="mdl-color--white">
        <span className={[styles.drawerTitle, 'mdl-layout-title'].join(' ')}>
            <img src="public/logo.png" width="32" height="32" className={styles.drawerTitleLogo} />
            <span className={styles.drawerTitleText}>Unleash</span>
        </span>
        <hr />
        <Navigation className={styles.navigation}>
            {routes.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={[styles.navigationLink, 'mdl-color-text--grey-900'].join(' ')}
                    activeClassName={[styles.navigationLink, 'mdl-color-text--black', 'mdl-color--blue-grey-100'].join(
                        ' '
                    )}
                >
                    <Icon name={item.icon} className={styles.navigationIcon} /> {item.title}
                </NavLink>
            ))}
        </Navigation>
        <hr />
        <Navigation className={styles.navigation}>
            {links.map(link => (
                <a
                    href={link.href}
                    key={link.href}
                    target="_blank"
                    className={[styles.navigationLink, 'mdl-color-text--grey-900'].join(' ')}
                    title={link.title}
                >
                    {getIcon(link.icon)} {link.value}
                </a>
            ))}
        </Navigation>
    </Drawer>
);

DrawerMenu.propTypes = {
    links: PropTypes.array,
};
