'use strict';

const React                   = require('react');
const Router                  = require('react-router');
const UnleashApp              = require('./UnleashApp');
const LogEntriesComponent     = require('./components/log/LogEntriesComponent');
const FeatureTogglesComponent = require('./components/feature/FeatureTogglesComponent');
const StrategiesComponent     = require('./components/strategy/StrategiesComponent');
const ArchiveFeatureComponent = require('./components/feature/ArchiveFeatureComponent');
const DefaultRoute = Router.DefaultRoute;
const Route = Router.Route;

const routes = (
    <Route name="app" path="/" handler={UnleashApp}>
        <Route name="strategies" handler={StrategiesComponent}/>
        <Route name="log" handler={LogEntriesComponent}/>
        <Route name="archive" handler={ArchiveFeatureComponent}/>
        <DefaultRoute name="features" handler={FeatureTogglesComponent}/>
    </Route>
);

module.exports = routes;
