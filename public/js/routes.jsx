var React                   = require('react');
var Router                  = require('react-router');
var UnleashApp              = require('./UnleashApp');
var LogEntriesComponent     = require('./components/log/LogEntriesComponent');
var FeatureTogglesComponent = require('./components/feature/FeatureTogglesComponent');
var StrategiesComponent     = require('./components/strategy/StrategiesComponent');
var ArchiveFeatureComponent = require('./components/feature/ArchiveFeatureComponent');
var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;

var routes = (
    <Route name="app" path="/" handler={UnleashApp}>
        <Route name="strategies" handler={StrategiesComponent}/>
        <Route name="log" handler={LogEntriesComponent}/>
        <Route name="archive" handler={ArchiveFeatureComponent}/>
        <DefaultRoute name="features" handler={FeatureTogglesComponent}/>
    </Route>
);

module.exports = routes;
