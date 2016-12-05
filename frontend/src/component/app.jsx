import React, { Component } from 'react';
import { Layout, Drawer, Header, Navigation, Content,
    Footer, FooterSection, FooterDropDownSection, FooterLinkList,
    Grid, Cell,
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
    constructor (props) {
        super(props);
        this.state = { drawerActive: false };

        this.toggleDrawerActive = () => {
            this.setState({ drawerActive: !this.state.drawerActive });
        };
    }
    static contextTypes = {
        router: React.PropTypes.object,
    }

    componentDidMount () {
        document.title = `${this.getCurrentSection()} - Unleash Admin`;
    }

    componentWillReceiveProps (nextProps) {
        // copied from https://github.com/react-mdl/react-mdl/issues/254
        // If our locations are different and drawer is open,
        // force a close
        if (this.props.location.pathname !== nextProps.location.pathname) {
            const layout = document.querySelector('.mdl-js-layout');
            const drawer = document.querySelector('.mdl-layout__drawer');

            if (layout.classList.contains('is-small-screen') && drawer.classList.contains('is-visible')) {
                layout.MaterialLayout.toggleDrawer();
            }
        }
    }

    getCurrentSection () {
        const { routes } = this.props;
        const lastRoute = routes[routes.length - 1];
        return lastRoute ? lastRoute.pageTitle : '';
    }

    getTitleWithLinks () {
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

        if (result.length > 2) {
            result = result.splice(1);
        }
        return (
            <span>
                {result.map((entry, index) => (
                    <span><Link style={{ color: '#f1f1f1', textDecoration: 'none' }} key={entry.link + index} to={entry.link}>
                        {entry.name}
                    </Link> {(index + 1) < result.length ? ' / ' : null}</span>
                ))}
            </span>
        );
    }

    onOverlayClick = () => this.setState({ drawerActive: false });

    render () {
        const createListItem = (path, caption) =>
            <a
                href={this.context.router.createHref(path)}
                className={this.context.router.isActive(path) ? style.active : ''}>
                {caption}
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
                            {createListItem('/features', 'Feature toggles')}
                            {createListItem('/strategies', 'Strategies')}
                            {createListItem('/history', 'Event history')}
                            {createListItem('/archive', 'Archived toggles')}
                            <hr />
                            {createListItem('/applications', 'Applications')}
                            {createListItem('/metrics', 'Client metrics')}
                            {createListItem('/client-strategies', 'Client strategies')}
                            {createListItem('/client-instances', 'Client instances')}
                        </Navigation>
                    </Drawer>
                    <Content>
                        <Grid>
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
                                        {createListItem('/metrics', 'Client metrics')}
                                        {createListItem('/client-strategies', 'Client strategies')}
                                        {createListItem('/client-instances', 'Client instances')}
                                    </FooterLinkList>
                                </FooterDropDownSection>
                                <FooterDropDownSection title="FAQ">
                                    <FooterLinkList>
                                        <a href="#">Help</a>
                                        <a href="#">Privacy & Terms</a>
                                        <a href="#">Questions</a>
                                        <a href="#">Answers</a>
                                        <a href="#">Contact Us</a>
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



        return (
            <div className={style.container}>
                <AppBar title="Unleash Admin" leftIcon="menu" onLeftIconClick={this.toggleDrawerActive} className={style.appBar}>
                    
                </AppBar>
                <div className={style.container} style={{ top: '6.4rem' }}>
                    <Layout>
                        <NavDrawer active={this.state.drawerActive} permanentAt="sm" onOverlayClick={this.onOverlayClick} >
                            <Navigation />
                        </NavDrawer>
                        <Panel scrollY>
                            <div style={{ padding: '1.8rem' }}>
                                
                                {this.props.children}
                            </div>
                        </Panel>
                        
                    </Layout>
                </div>
            </div>
        );
    }
};
