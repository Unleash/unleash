import 'whatwg-fetch';
import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';

import React from 'react';
import ReactDOM from 'react-dom';
import { applyRouterMiddleware, Router, Route, IndexRedirect, hashHistory } from 'react-router';
import { useScroll } from 'react-router-scroll';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

import store from './store';
import MetricsPoller from './metrics-poller';
import App from './component/app';

import Features from './page/features';
import CreateFeatureToggle from './page/features/create';
import ViewFeatureToggle from './page/features/show';
import Strategies from './page/strategies';
import StrategyView from './page/strategies/show';
import CreateStrategies from './page/strategies/create';
import HistoryPage from './page/history';
import HistoryTogglePage from './page/history/toggle';
import Archive from './page/archive';
import ShowArchive from './page/archive/show';
import Applications from './page/applications';
import ApplicationView from './page/applications/view';
import LogoutFeatures from './page/user/logout';

let composeEnhancers;

if (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
} else {
    composeEnhancers = compose;
}

const unleashStore = createStore(store, composeEnhancers(applyMiddleware(thunkMiddleware)));
const metricsPoller = new MetricsPoller(unleashStore);
metricsPoller.start();

// "pageTitle" and "link" attributes are for internal usage only

ReactDOM.render(
    <Provider store={unleashStore}>
        <Router history={hashHistory} render={applyRouterMiddleware(useScroll())}>
            <Route path="/" component={App}>
                <IndexRedirect to="/features" />

                <Route pageTitle="Feature Toggles" link="/features">
                    <Route pageTitle="Feature toggles" path="/features" component={Features} />
                    <Route pageTitle="New" path="/features/create" component={CreateFeatureToggle} />
                    <Route pageTitle=":name" path="/features/:activeTab/:name" component={ViewFeatureToggle} />
                </Route>

                <Route pageTitle="Strategies" link="/strategies">
                    <Route pageTitle="Strategies" path="/strategies" component={Strategies} />
                    <Route pageTitle="New" path="/strategies/create" component={CreateStrategies} />
                    <Route
                        pageTitle=":strategyName"
                        path="/strategies/:activeTab/:strategyName"
                        component={StrategyView}
                    />
                </Route>

                <Route pageTitle="Event History" link="/history">
                    <Route pageTitle="Event history" path="/history" component={HistoryPage} />
                    <Route pageTitle=":toggleName" path="/history/:toggleName" component={HistoryTogglePage} />
                </Route>
                <Route pageTitle="Archived Toggles" link="/archive">
                    <Route pageTitle="Archived Toggles" path="/archive" component={Archive} />
                    <Route pageTitle=":name" path="/archive/:activeTab/:name" component={ShowArchive} />
                </Route>

                <Route pageTitle="Applications" link="/applications">
                    <Route pageTitle="Applications" path="/applications" component={Applications} />
                    <Route pageTitle=":name" path="/applications/:name" component={ApplicationView} />
                </Route>
                <Route pageTitle="Logout" link="/logout">
                    <Route pageTitle="Logout" path="/logout" component={LogoutFeatures} />
                </Route>
            </Route>
        </Router>
    </Provider>,
    document.getElementById('app')
);
