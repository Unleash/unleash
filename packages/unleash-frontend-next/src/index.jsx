import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import store from './store';
import App from './App';

import Features from './page/features';
import Strategies from './page/strategies';
import Logs from './page/logs';
import Archive from './page/archive';

const unleashStore = createStore(store);

ReactDOM.render(
    <Provider store={unleashStore}>
        <Router history={hashHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Features} />
                <Route path="/strategies" component={Strategies} />
                <Route path="/logs" component={Logs} />
                <Route path="/archive" component={Archive} />
            </Route>
        </Router>
    </Provider>, document.getElementById('app'));
