import React, { Component } from 'react';
import { Layout, Panel, NavDrawer, AppBar } from 'react-toolbox';
import style from './style';

import Navigation from './Navigation';

export default class App extends Component {
    constructor (props) {
        super(props);
        this.state = { drawerActive: false };

        this.toggleDrawerActive = () => {
            this.setState({ drawerActive: !this.state.drawerActive });
        };
    }

    render () {
        return (
            <div className={style.container}>
                <AppBar title="Unleash Admin" leftIcon="menu" onLeftIconClick={this.toggleDrawerActive} />
                <Layout>
                    <NavDrawer active={this.state.drawerActive} permanentAt="sm" style={{ width: '200px' }}>
                        <Navigation />
                    </NavDrawer>
                    <Panel scrollY={false}>
                        <div style={{ padding: '1.8em' }}>
                            {this.props.children}
                        </div>

                    </Panel>
                </Layout>
            </div>
        );
    }
};
