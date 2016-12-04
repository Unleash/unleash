import React, { Component } from 'react';
import { Layout, Drawer, Header, Navigation, Content,
    Footer, FooterSection, FooterDropDownSection, FooterLinkList,
    Grid, Cell
} from 'react-mdl';
import style from './styles.scss';
import ErrorContainer from './error/error-container';

import UserContainer from './user/user-container';
import ShowUserContainer from './user/show-user-container';



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
                    <Header title={<span><span style={{ color: '#ddd' }}>Unleash Admin / </span><strong>The Title</strong></span>}>
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
                            {createListItem('/metrics', 'Client metrics')}
                            {createListItem('/client-strategies', 'Client strategies')}
                            {createListItem('/client-instances', 'Client instances')}
                        </Navigation>
                    </Drawer>
                    <Content>
                        <Grid noSpacing>
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
