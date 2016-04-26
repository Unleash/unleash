import React from 'react'
import { DefaultRoute, Router, Route} from 'react-router'
import UnleashApp from './UnleashApp'
import LogEntriesComponent from './components/log/LogEntriesComponent'
import FeatureTogglesComponent from './components/feature/FeatureTogglesComponent'
import StrategiesComponent from './components/strategy/StrategiesComponent'
import ArchiveFeatureComponent from './components/feature/ArchiveFeatureComponent'

const routes = (
    <Route name="app" path="/" handler={UnleashApp}>
        <Route name="strategies" handler={StrategiesComponent}/>
        <Route name="log" handler={LogEntriesComponent}/>
        <Route name="archive" handler={ArchiveFeatureComponent}/>
        <DefaultRoute name="features" handler={FeatureTogglesComponent}/>
    </Route>
);

module.exports = routes;
