import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Layout,
    Drawer,
    Header,
    Navigation,
    Content,
    Footer,
    FooterSection,
    FooterDropDownSection,
    FooterLinkList,
    Grid,
    Cell,
    Icon,
} from 'react-mdl';
import { Link } from 'react-router';
import styles from './styles.scss';
import ErrorContainer from './error/error-container';

import AuthenticationContainer from './user/authentication-container';
import ShowUserContainer from './user/show-user-container';
import ShowApiDetailsContainer from './api/show-api-details-container';
import { ScrollContainer } from 'react-router-scroll';
import { logoutUser } from '../store/user/actions';

function replace(input, params) {
    if (!params) {
        return input;
    }
    Object.keys(params).forEach(key => {
        input = input.replace(`:${key}`, params[key]);
    });
    return input;
}

export default class App extends Component {
    static propTypes = {
        location: PropTypes.object.isRequired,
        params: PropTypes.object.isRequired,
        routes: PropTypes.array.isRequired,
    };

    static contextTypes = {
        router: PropTypes.object,
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.location.pathname !== nextProps.location.pathname) {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                const layout = document.querySelector('.mdl-js-layout');
                const drawer = document.querySelector('.mdl-layout__drawer');
                // hack, might get a built in alternative later
                if (drawer.classList.contains('is-visible')) {
                    layout.MaterialLayout.toggleDrawer();
                }
            }, 10);
        }
    }

    getSections() {
        const { routes, params } = this.props;
        const unique = {};
        const result = routes
            .splice(1)
            .map(routeEntry => ({
                name: replace(routeEntry.pageTitle, params),
                link: replace(routeEntry.link || routeEntry.path, params),
            }))
            .filter(entry => {
                if (!unique[entry.link]) {
                    unique[entry.link] = true;
                    return true;
                }
                return false;
            });

        // mutate document.title:
        document.title = result
            .map(e => e.name)
            .reverse()
            .concat('Unleash')
            .join(' – ');

        return result;
    }

    getTitleWithLinks() {
        const result = this.getSections();
        return (
            <span>
                {result.map((entry, index) => (
                    <span key={entry.link + index} className={index > 0 ? 'mdl-layout--large-screen-only' : ''}>
                        {index > 0 ? ' › ' : null}
                        <Link
                            className={[styles.headerTitleLink, 'mdl-color-text--primary-contrast'].join(' ')}
                            to={entry.link}
                        >
                            {entry.name}
                        </Link>
                    </span>
                ))}
            </span>
        );
    }

    render() {
        const shouldUpdateScroll = (prevRouterProps, { location }) => {
            if (prevRouterProps && location.pathname !== prevRouterProps.location.pathname) {
                return location.action === 'POP';
            } else {
                return [0, 0];
            }
        };
        const createListItem = (path, caption, icon, isDrawerNavigation = false) => {
            const linkColor =
                isDrawerNavigation && this.context.router.isActive(path)
                    ? 'mdl-color-text--black'
                    : 'mdl-color-text--grey-900';
            const iconColor =
                isDrawerNavigation && this.context.router.isActive(path)
                    ? 'mdl-color-text--black'
                    : 'mdl-color-text--grey-600';
            const renderIcon = (
                <Icon
                    name={icon}
                    className={isDrawerNavigation ? [styles.navigationIcon, iconColor].join(' ') : undefined}
                />
            );
            return (
                <Link
                    to={path}
                    className={isDrawerNavigation ? [styles.navigationLink, linkColor].join(' ') : undefined}
                >
                    {icon && renderIcon}
                    {caption}
                </Link>
            );
        };

        return (
            <div className={styles.container}>
                <AuthenticationContainer />
                <Layout fixedHeader>
                    <Header title={this.getTitleWithLinks()}>
                        <Navigation>
                            <ShowUserContainer />
                        </Navigation>
                    </Header>
                    <Drawer className="mdl-color--white">
                        <span className={[styles.drawerTitle, 'mdl-layout-title'].join(' ')}>
                            <img src="public/logo.png" width="32" height="32" className={styles.drawerTitleLogo} />
                            <span className={styles.drawerTitleText}>Unleash</span>
                        </span>
                        <hr />
                        <Navigation className={styles.navigation}>
                            {createListItem('/features', 'Feature Toggles', 'list', true)}
                            {createListItem('/strategies', 'Strategies', 'extension', true)}
                            {createListItem('/history', 'Event History', 'history', true)}
                            {createListItem('/archive', 'Archived Toggles', 'archive', true)}
                            {createListItem('/applications', 'Applications', 'apps', true)}
                            {createListItem('logout', 'Sign out', 'exit_to_app', true)}
                        </Navigation>
                        <hr />
                        <Navigation className={styles.navigation}>
                            <a
                                href="https://github.com/Unleash"
                                target="_blank"
                                className={[styles.navigationLink, 'mdl-color-text--grey-900'].join(' ')}
                            >
                                <i className={['material-icons', styles.navigationIcon, styles.iconGitHub].join(' ')} />GitHub
                            </a>
                        </Navigation>
                    </Drawer>
                    <ScrollContainer scrollKey="container" shouldUpdateScroll={shouldUpdateScroll}>
                        <Content className="mdl-color--grey-50">
                            <Grid noSpacing className={styles.content}>
                                <Cell col={12}>
                                    {this.props.children}
                                    <ErrorContainer />
                                </Cell>
                            </Grid>
                            <Footer size="mega">
                                <FooterSection type="middle">
                                    <FooterDropDownSection title="Menu">
                                        <FooterLinkList>
                                            {createListItem('/features', 'Feature Toggles', '')}
                                            {createListItem('/strategies', 'Strategies', '')}
                                            {createListItem('/history', 'Event History', '')}
                                            {createListItem('/archive', 'Archived Toggles', '')}
                                            {createListItem('/applications', 'Applications', '')}
                                            {createListItem('/logout', 'Sign out', '')}
                                        </FooterLinkList>
                                    </FooterDropDownSection>
                                    <FooterDropDownSection title="Clients">
                                        <FooterLinkList>
                                            <a href="https://github.com/Unleash/unleash-client-node/">Node.js</a>
                                            <a href="https://github.com/Unleash/unleash-client-java/">Java</a>
                                            <a href="https://github.com/Unleash/unleash-client-go/">Go</a>
                                        </FooterLinkList>
                                    </FooterDropDownSection>
                                </FooterSection>
                                <ShowApiDetailsContainer />
                            </Footer>
                        </Content>
                    </ScrollContainer>
                </Layout>
            </div>
        );
    }
}
