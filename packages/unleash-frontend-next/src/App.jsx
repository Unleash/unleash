import React, { Component } from 'react';
import { Layout, Panel, NavDrawer } from 'react-toolbox';
import { AppBar, IconButton } from 'react-toolbox';
import style from './style'

import Navigation from './Navigation';

export default class App extends Component {
    state = {
        drawerActive: false,
    };

    toggleDrawerActive = () => {
        this.setState({ drawerActive: !this.state.drawerActive });
    };

    render () {
        return (
            <div className={style.container}>
                <AppBar>
                    <IconButton icon="menu" onClick={ this.toggleDrawerActive }/>
                </AppBar>
                <Layout>
                    <NavDrawer
                        active={this.state.drawerActive}
                        permanentAt="sm" style={{ width: '200px' }}
                    >
                        <Navigation />
                    </NavDrawer>
                    <Panel scrollY={false}>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.8rem', minHeight: '100%' }}>
                            {this.props.children}
                        </div>

                    </Panel>
                </Layout>
            </div>
        );
    }
};
