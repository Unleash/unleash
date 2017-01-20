import React, { Component, PropTypes } from 'react';
import { Layout, Drawer, Header, Navigation, Content,
    Footer, FooterSection, FooterDropDownSection, FooterLinkList,
    Grid, Cell, Icon,
} from 'react-mdl';
import { Link } from 'react-router';
import styles from './styles.scss';
import { styles as commonStyles } from './common';
import ErrorContainer from './error/error-container';

import UserContainer from './user/user-container';
import ShowUserContainer from './user/show-user-container';
import { ScrollContainer } from 'react-router-scroll';

const base = {
    name: 'Unleash',
    link: '/',
};

function replace (input, params) {
    if (!params) {
        return input;
    }
    Object.keys(params).forEach(key => {
        input = input.replace(`:${key}`, params[key]);
    });
    return input;
}

export default class App extends Component {
    static propTypes () {
        return {
            location: PropTypes.object.isRequired,
            params: PropTypes.object.isRequired,
            routes: PropTypes.array.isRequired,
        };
    }

    static contextTypes = {
        router: React.PropTypes.object,
    }

    componentWillReceiveProps (nextProps) {
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

    getSections () {
        if (window.innerWidth < 768) {
            return [base];
        }
        const { routes, params } = this.props;
        const unique = {};
        let result = [base].concat(routes.splice(1).map((routeEntry) => ({
            name: replace(routeEntry.pageTitle, params),
            link: replace(routeEntry.link || routeEntry.path, params),
        }))).filter(entry => {
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
            .join(' - ');

        return result;
    }

    getTitleWithLinks () {
        const result = this.getSections();
        return (
            <span>
                {result.map((entry, index) => (
                    <span key={entry.link + index}><Link style={{ color: '#f1f1f1', textDecoration: 'none' }} to={entry.link}>
                        {entry.name}
                    </Link> {(index + 1) < result.length ? ' / ' : null}</span>
                ))}
            </span>
        );
    }

    render () {
        const shouldUpdateScroll = (prevRouterProps, { location }) => {
            if (prevRouterProps && location.pathname !== prevRouterProps.location.pathname) {
                return location.action === 'POP';
            } else {
                return [0, 0];
            }
        };
        const createListItem = (path, caption, icon, isDrawerNavigation = false) => {
            const linkColor = isDrawerNavigation &&
                this.context.router.isActive(path) ? 'mdl-color-text--black' : 'mdl-color-text--grey-900';
            const iconColor = isDrawerNavigation &&
                this.context.router.isActive(path) ? 'mdl-color-text--black' : 'mdl-color-text--grey-600';
            return (
                <Link
                    to={path}
                    className={isDrawerNavigation && [styles.navigationLink, linkColor].join(' ')}>
                    {icon && <Icon name={icon} className={isDrawerNavigation && [styles.navigationIcon, iconColor].join(' ')}/>}{caption}
                </Link>
            );
        };

        return (
            <div>
                <UserContainer />
                <Layout fixedHeader>
                    <Header title={this.getTitleWithLinks()}>
                        <Navigation>
                            <ShowUserContainer />
                        </Navigation>
                    </Header>
                    <Drawer className="mdl-color--white">
                        <span className={[styles.title, 'mdl-layout-title'].join(' ')}>Unleash</span>
                        <hr className={commonStyles.divider}/>
                        <Navigation className={styles.navigation}>
                            {createListItem('/features', 'Feature toggles', 'list', true)}
                            {createListItem('/strategies', 'Strategies', 'extension', true)}
                            {createListItem('/history', 'Event history', 'history', true)}
                            {createListItem('/archive', 'Archived toggles', 'archive', true)}
                            {createListItem('/applications', 'Applications', 'apps', true)}
                        </Navigation>
                        <hr className={commonStyles.divider}/>
                        <Navigation className={styles.navigation}>
                            <a href="https://github.com/Unleash" target="_blank" className={[styles.navigationLink, 'mdl-color-text--grey-900'].join(' ')}>
                                <i className={[
                                    'material-icons',
                                    styles.navigationIcon,
                                    styles.githubIcon,
                                    'mdl-color-text--grey-600',
                                ].join(' ')}/>GitHub
                            </a>
                        </Navigation>
                    </Drawer>
                    <ScrollContainer scrollKey="container" shouldUpdateScroll={shouldUpdateScroll}>
                    <Content>
                        <Grid shadow={1} style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            <Cell col={12}>
                                {this.props.children}
                                <ErrorContainer />
                            </Cell>
                        </Grid>
                        <Footer size="mega">
                            <FooterSection type="middle">
                                <FooterDropDownSection title="Menu">
                                    <FooterLinkList>
                                        {createListItem('/features', 'Feature toggles')}
                                        {createListItem('/strategies', 'Strategies')}
                                        {createListItem('/history', 'Event history')}
                                        {createListItem('/archive', 'Archived toggles')}
                                    </FooterLinkList>
                                </FooterDropDownSection>
                                <FooterDropDownSection title="Metrics">
                                    <FooterLinkList>
                                        {createListItem('/applications', 'Applications')}
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
                            <FooterSection type="bottom" logo="Unleash Admin">
                                <FooterLinkList>
                                    <a href="https://github.com/Unleash/unleash/" target="_blank">
                                            GitHub
                                    </a>
                                    <a href="https://finn.no" target="_blank"><small>A product by</small> FINN.no</a>
                                </FooterLinkList>
                            </FooterSection>
                        </Footer>
                    </Content>
                    </ScrollContainer>
                </Layout>
            </div>
        );
    }
};
