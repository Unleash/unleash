var React   = require('react');
var TabView  = require('./components/TabView');
var Menu    = require('./components/Menu');
var Unleash = require('./components/Unleash');
var Strategy = require('./components/strategy/StrategyComponent');

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