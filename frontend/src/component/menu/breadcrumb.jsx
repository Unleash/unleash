import React from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import { routes, getRoute } from './routes';

import styles from '../styles.scss';

const renderDoubleBread = (currentTitle, parentRoute) => {
    document.title = `${currentTitle} -  ${parentRoute.title} - Unleash`;
    return (
        <span>
            <Link
                className={[styles.headerTitleLink, 'mdl-color-text--primary-contrast'].join(' ')}
                to={parentRoute.path}
            >
                {parentRoute.title}
            </Link>
            <span className="mdl-layout--large-screen-only">
                <span> › </span>
                <span className={[styles.headerTitleLink, 'mdl-color-text--primary-contrast'].join(' ')}>
                    {currentTitle}
                </span>
            </span>
        </span>
    );
};

const renderBread = route => {
    document.title = `${route.title} - Unleash`;
    return (
        <span className="mdl-layout--large-screen-only">
            <span className={[styles.headerTitleLink, 'mdl-color-text--primary-contrast'].join(' ')}>
                {route.title}
            </span>
        </span>
    );
};

const renderRoute = (params, route) => {
    if (!route) {
        return null;
    }
    const title = route.title.startsWith(':') ? params[route.title.substring(1)] : route.title;
    return route.parent ? renderDoubleBread(title, getRoute(route.parent)) : renderBread(route);
};

/*
    Render the breadcrumb.

    We only support two levels.

    Examples:
     - Features
     - Features > Create
     - Features > SomeToggle
 */
const Breadcrumb = () => (
    <Switch>
        {routes.map(route => (
            <Route
                key={route.path}
                path={route.path}
                render={({ match: { params } } = this.props) => renderRoute(params, route)}
            />
        ))}
    </Switch>
);

export default Breadcrumb;
