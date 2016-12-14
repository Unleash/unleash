import React, { Component } from 'react';
import { Layout, Drawer, Header, Navigation, Content,
    Footer, FooterSection, FooterDropDownSection, FooterLinkList,
    Grid, Cell, Icon,
} from 'react-mdl';
import { Link } from 'react-router';
import style from './styles.scss';
import ErrorContainer from './error/error-container';

import UserContainer from './user/user-container';
import ShowUserContainer from './user/show-user-container';

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

    static contextTypes = {
        router: React.PropTypes.object,
    }

    componentWillReceiveProps (nextProps) {
        if (this.props.location.pathname !== nextProps.location.pathname) {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                window.requestAnimationFrame(() => {
                    document.querySelector('.mdl-layout__content').scrollTop = 0;
                });

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

        if (result.length > 2) {
            result = result.splice(1);
        }

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
        const createListItem = (path, caption, icon) =>
            <a
                href={this.context.router.createHref(path)}
                className={this.context.router.isActive(path) ? style.active : ''}>
                {icon && <Icon name={icon} />} {caption}
            </a>;

        return (
            <div style={{}}>
                <UserContainer />
                <Layout fixedHeader>
                    <Header title={this.getTitleWithLinks()}>
                        <Navigation>
                            <a href="https://github.com/Unleash" target="_blank">Github</a>
                            <ShowUserContainer />
                        </Navigation>
                    </Header>
                    <Drawer title="Unleash Admin">
                        <Navigation>
                            {createListItem('/features', 'Feature toggles', 'list')}
                            {createListItem('/strategies', 'Strategies', 'extension')}
                            {createListItem('/history', 'Event history', 'history')}
                            {createListItem('/archive', 'Archived toggles', 'archive')}
                            {createListItem('/applications', 'Applications', 'apps')}
                            {/* createListItem('/metrics', 'Client metrics')*/}
                            {/* createListItem('/client-strategies', 'Client strategies')*/}
                            {/* createListItem('/client-instances', 'Client instances')*/}
                        </Navigation>
                    </Drawer>
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
                                        {/* createListItem('/metrics', 'Client metrics')*/}
                                        {/* createListItem('/client-strategies', 'Client strategies')*/}
                                        {/* createListItem('/client-instances', 'Client instances')*/}
                                    </FooterLinkList>
                                </FooterDropDownSection>
                                <FooterDropDownSection title="Clients">
                                    <FooterLinkList>
                                        <a href="https://github.com/Unleash/unleash-node-client/">Node.js</a>
                                        <a href="https://github.com/Unleash/unleash-java-client/">Java</a>
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
                </Layout>
            </div>
        );
    }
};
