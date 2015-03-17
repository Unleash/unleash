var React                   = require('react');
var TabView                 = require('./components/TabView');
var Menu                    = require('./components/Menu');
var UserStore               = require('./stores/UserStore');
var ErrorMessages           = require('./components/ErrorMessages');
var LogEntriesComponent     = React.createFactory(require('./components/log/LogEntriesComponent'));
var FeatureTogglesComponent = React.createFactory(require('./components/feature/FeatureTogglesComponent'));
var StrategiesComponent     = React.createFactory(require('./components/strategy/StrategiesComponent'));
var ArchiveFeatureComponent = React.createFactory(require('./components/feature/ArchiveFeatureComponent'));

UserStore.init();

var tabPanes = [
{
    name: 'Feature Toggles',
    slug: 'feature-toggles',
    content: new FeatureTogglesComponent({})
},
{
    name: 'Strategies',
    slug: 'strategies',
    content: new StrategiesComponent({})
},
{
    name: "Log",
    slug: 'log',
    content: new LogEntriesComponent({})
},
{
    name: "Archive",
    slug: 'archive',
    content: new ArchiveFeatureComponent({})
}
];


var UnleashApp = React.createClass({
    getInitialState: function() {
        return {
            featureToggles: [],
            archivedToggles: [],
            strategies: []

        };
    },

    render: function () {
        return (
            <div>
                <Menu />
                <div className="container">
                    <div className="page">
                        <ErrorMessages />
                        <TabView tabPanes={tabPanes} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = UnleashApp;
