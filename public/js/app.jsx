var React   = require('react');
var TabView  = React.createFactory(require('./components/TabView'));
var Menu     = React.createFactory(require('./components/Menu'));
var Unleash  = React.createFactory(require('./components/Unleash'));
var Strategy = React.createFactory(require('./components/strategy/StrategyComponent'));

var tabPanes = [
    {
        name: "Feature Toggles",
        content: new Unleash({pollInterval: 5000})
    },
    {
        name: "Strategies",
        content: new Strategy({})
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