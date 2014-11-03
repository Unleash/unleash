var React                  = require('react');
var TabView                = React.createFactory(require('./components/TabView'));
var Menu                   = React.createFactory(require('./components/Menu'));
var FeatureToggleComponent = React.createFactory(require('./components/feature/FeatureToggleComponent'));
var StrategyComponent      = React.createFactory(require('./components/strategy/StrategyComponent'));

var tabPanes = [
    {
        name: "Feature Toggles",
        content: new FeatureToggleComponent({pollInterval: 5000})
    },
    {
        name: "Strategies",
        content: new StrategyComponent({})
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