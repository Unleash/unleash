var React                   = require('react');
var TabView                 = require('./components/TabView');
var Menu                    = require('./components/Menu');
var LogEntriesComponent         = React.createFactory(require('./components/log/LogEntriesComponent'));
var FeatureTogglesComponent = React.createFactory(require('./components/feature/FeatureTogglesComponent'));
var StrategiesComponent     = React.createFactory(require('./components/strategy/StrategiesComponent'));


var tabPanes = [
    {
        name: "Feature Toggles",
        content: new FeatureTogglesComponent({pollInterval: 5000})
    },
    {
        name: "Strategies",
        content: new StrategiesComponent({})
    },
    {
        name: "Log",
        content: new LogEntriesComponent({})
    }
];

React.render(
    <div>
        <Menu />
        <div className="container">
            <div className="page">
                <TabView tabPanes={tabPanes} />
            </div>
        </div>
    </div>
    ,
    document.getElementById('content')
);