import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRedirect, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

import store from './store';
import App from './component/app';

import Features from './page/features';
import CreateFeatureToggle from './page/features/create';
import EditFeatureToggle from './page/features/edit';
import Strategies from './page/strategies';
import CreateStrategies from './page/strategies/create';
import HistoryPage from './page/history';
import Archive from './page/archive';

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });

const unleashStore = createStore(
    store,
    applyMiddleware(
        thunkMiddleware
    )
);

ReactDOM.render(
    <Provider store={unleashStore}>
        <Router history={appHistory}>
            <Route path="/" component={App}>
                <IndexRedirect to="/features" />
                <Route path="/features" component={Features} />
                <Route path="/features/create" component={CreateFeatureToggle} />
                <Route path="/features/edit/:name" component={EditFeatureToggle} />
                <Route path="/strategies" component={Strategies} />
                <Route path="/strategies/create" component={CreateStrategies} />
                <Route path="/history" component={HistoryPage} />
                <Route path="/archive" component={Archive} />
            </Route>
        </Router>
    </Provider>, document.getElementById('app'));
