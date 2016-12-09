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

const unleashStore = createStore(
    store,
    applyMiddleware(
        thunkMiddleware
    )
);

// "pageTitle" and "link" attributes are for internal usage only

ReactDOM.render(
    <Provider store={unleashStore}>
        <Router history={hashHistory}>
            <Route path="/" component={App}>
                <IndexRedirect to="/features" />

                <Route pageTitle="Features" link="/features">
                    <Route pageTitle="Features" path="/features" component={Features} />
                    <Route pageTitle="New" path="/features/create" component={CreateFeatureToggle} />
                    <Route pageTitle=":name" path="/features/edit/:name" component={EditFeatureToggle} />
                </Route>
                
                <Route pageTitle="Strategies" link="/strategies">
                    <Route pageTitle="Strategies" path="/strategies" component={Strategies} />
                    <Route pageTitle="New" path="/strategies/create" component={CreateStrategies} />
                    <Route pageTitle=":strategyName" path="/strategies/view/:strategyName" component={StrategyView} />
                </Route>
                
                <Route pageTitle="History" link="/history">
                    <Route pageTitle="History"  path="/history" component={HistoryPage} />
                    <Route pageTitle=":toggleName" path="/history/:toggleName" component={HistoryTogglePage} />
                </Route>

                <Route pageTitle="Archive" path="/archive" component={Archive} />
                <Route pageTitle="Applications" link="/applications">
                    <Route pageTitle="Applications" path="/applications" component={Applications} />
                    <Route pageTitle=":name" path="/applications/:name" component={ApplicationView} />
                </Route>
                
            </Route>
        </Router>
    </Provider>, document.getElementById('app'));
