import React, { Component } from 'react';
import { Layout, Panel, NavDrawer, AppBar } from 'react-toolbox';
import style from './styles.scss';
import ErrorContainer from './error/error-container';

import UserContainer from './user/user-container';

import Navigation from './nav';

export default class App extends Component {
    constructor (props) {
        super(props);
        this.state = { drawerActive: false };

        this.toggleDrawerActive = () => {
            this.setState({ drawerActive: !this.state.drawerActive });
        };
    }

    onOverlayClick = () => this.setState({ drawerActive: false });

    render () {
        return (
            <div className={style.container}>
                <AppBar title="Unleash Admin" leftIcon="menu" onLeftIconClick={this.toggleDrawerActive} className={style.appBar} />
                <div className={style.container} style={{ top: '6.4rem' }}>
                    <Layout>
                        <NavDrawer active={this.state.drawerActive} permanentAt="sm" onOverlayClick={this.onOverlayClick} >
                            <Navigation />
                        </NavDrawer>
                        <Panel scrollY>
                            <div style={{ padding: '1.8rem' }}>
                                <UserContainer />
                                {this.props.children}
                            </div>
                        </Panel>
                        <ErrorContainer />
                    </Layout>
                </div>
            </div>
        );
    }
};
