import React, { Component } from 'react';
import { AppBar } from 'react-toolbox/lib/app_bar';
import { Navigation} from 'react-toolbox/lib/navigation';
import Link from 'react-toolbox/lib/link';

export default class App extends Component {
    render () {
        return (
            <AppBar>
                <div>
                    <Navigation type='horizontal' className="navigation">
                        <Link href='' label='Feature Toggles' />
                        <Link href='' active label='Strategies'  />
                        <Link href='' active label='Documentation'  />
                    </Navigation>
                </div>
            </AppBar>
        );
    }
};
