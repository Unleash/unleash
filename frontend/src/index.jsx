import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

import store from './store';
import App from './component/app';

import Features from './page/features';
import CreateFeatureToggle from './page/features/create';
import EditFeatureToggle from './page/features/edit';
import Strategies from './page/strategies';
import StrategyView from './page/strategies/show';
import CreateStrategies from './page/strategies/create';
import HistoryPage from './page/history';
import HistoryTogglePage from './page/history/toggle';
import Archive from './page/archive';
import Applications from './page/applications';
import ApplicationView from './page/applications/view';
import ClientStrategies from './page/client-strategies';

const unleashStore = createStore(
    store,
    applyMiddleware(
        thunkMiddleware
    )
);

ReactDOM.render(
    <Provider store={unleashStore}>
        <Router history={hashHistory}>
            <Route path="/" component={App}>
                <IndexRedirect to="/features" />
                <Route pageTitle="Features" path="/features" component={Features} />
                <Route pageTitle="Features" path="/features/create" component={CreateFeatureToggle} />
                <Route pageTitle="Features" path="/features/edit/:name" component={EditFeatureToggle} />
                <Route pageTitle="Strategies" path="/strategies" component={Strategies} />
                <Route pageTitle="Strategies" path="/strategies/create" component={CreateStrategies} />
                <Route pageTitle="Strategies" path="/strategies/view/:strategyName" component={StrategyView} />
                <Route pageTitle="History"  path="/history" component={HistoryPage} />
                <Route pageTitle="History" path="/history/:toggleName" component={HistoryTogglePage} />
                <Route pageTitle="Archive" path="/archive" component={Archive} />
                <Route pageTitle="Applications" path="/applications" component={Applications} />
                <Route pageTitle="Applications" path="/applications/:name" component={ApplicationView} />
                <Route pageTitle="Client strategies" ppath="/client-strategies" component={ClientStrategies} />
            </Route>
        </Router>
    </Provider>, document.getElementById('app'));
