var React                   = require('react');
var Router                  = require('react-router');
var Menu                    = require('./components/Menu');
var ErrorMessages           = require('./components/ErrorMessages');
var initalizer              = require('./stores/initalizer');
var FeatureToggleStore      = require('./stores/FeatureToggleStore');
var StrategyStore           = require('./stores/StrategyStore');
var ArchiveStore            = require('./stores/ArchivedToggleStore');
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;

var UnleashApp = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    getInitialState: function() {
        return {
            features:           FeatureToggleStore.getFeatureToggles(),
            strategies:         StrategyStore.getStrategies(),
            archivedFeatures:   ArchiveStore.getArchivedToggles()
        };
    },

    onFeatureToggleChange: function() {
        this.setState({
            features: FeatureToggleStore.getFeatureToggles()
        });
    },

    onStrategiesChange: function() {
        this.setState({
            strategies: StrategyStore.getStrategies()
        });
    },

    onArchiveChange: function() {
        this.setState({
            archivedFeatures: ArchiveStore.getArchivedToggles()
        });
    },

    componentDidMount: function() {
        this.unsubscribeFS = FeatureToggleStore.listen(this.onFeatureToggleChange);
        this.unsubscribeSS = StrategyStore.listen(this.onStrategiesChange);
        this.unsubscribeAS = ArchiveStore.listen(this.onArchiveChange);
    },
    componentWillUnmount: function() {
        this.unsubscribeFS();
        this.unsubscribeSS();
        this.unsubscribeAS();
    },

    componentWillMount: function() {
        initalizer(30);
    },

    renderLink: function(id, label) {
        return    (
            <Link to={id} className="nav-element centerify" activeClassName="nav-active">
                <span className="topbar-nav-svg-caption caption showbydefault no-break">{label}</span>
            </Link>
        );
    },

    render: function () {
        return (
            <div>
                <Menu>
                    {this.renderLink("features",    "Toggles")}
                    {this.renderLink("strategies",  "Strategies")}
                    {this.renderLink("log",         "Log")}
                    {this.renderLink("archive",     "Archive")}
                </Menu>
                <div className="container">
                    <div className="page">
                        <ErrorMessages />
                        <div className="mod shadow mrn pan">
                            <div className="inner pan">
                                <div className="bd">
                                    <RouteHandler
                                            features={this.state.features}
                                            strategies={this.state.strategies}
                                            archivedFeatures={this.state.archivedFeatures}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});


module.exports = UnleashApp;
