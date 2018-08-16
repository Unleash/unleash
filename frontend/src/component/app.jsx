import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Header, Navigation, Content, Footer, Grid, Cell } from 'react-mdl';
import { Route, Redirect, Switch } from 'react-router-dom';
import styles from './styles.scss';
import ErrorContainer from './error/error-container';

import AuthenticationContainer from './user/authentication-container';
import ShowUserContainer from './user/show-user-container';
import ShowApiDetailsContainer from './api/show-api-details-container';
import Features from '../page/features';
import { DrawerMenu } from './menu/drawer';
import { FooterMenu } from './menu/footer';
import Breadcrum from './menu/breadcrumb';
import { routes } from './menu/routes';

export default class App extends Component {
    static propTypes = {
        location: PropTypes.object.isRequired,
        match: PropTypes.object.isRequired,
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

    render() {
        return (
            <div className={styles.container}>
                <AuthenticationContainer />
                <Layout fixedHeader>
                    <Header title={<Route path="/:path" component={Breadcrum} />}>
                        <Navigation>
                            <ShowUserContainer />
                        </Navigation>
                    </Header>
                    <DrawerMenu />
                    <Content className="mdl-color--grey-50">
                        <Grid noSpacing className={styles.content}>
                            <Cell col={12}>
                                <Switch>
                                    <Route
                                        exact
                                        path="/"
                                        render={() => <Redirect to="/features" component={Features} />}
                                    />
                                    {routes.map(route => (
                                        <Route key={route.path} path={route.path} component={route.component} />
                                    ))}
                                </Switch>
                                <ErrorContainer />
                            </Cell>
                        </Grid>
                        <Footer size="mega">
                            <FooterMenu />
                            <ShowApiDetailsContainer />
                        </Footer>
                    </Content>
                </Layout>
            </div>
        );
    }
}
