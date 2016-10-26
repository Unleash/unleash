'use strict';

const React                   = require('react');
const Router                  = require('react-router');
const Menu                    = require('./components/Menu');
const ErrorMessages           = require('./components/ErrorMessages');
const initalizer              = require('./stores/initalizer');
const FeatureToggleStore      = require('./stores/FeatureToggleStore');
const StrategyStore           = require('./stores/StrategyStore');
const ArchiveStore            = require('./stores/ArchivedToggleStore');
const Link = Router.Link;
const RouteHandler = Router.RouteHandler;

const UnleashApp = React.createClass({
    contextTypes: {
        router: React.PropTypes.func,
    },

    getInitialState () {
        return {
            features: FeatureToggleStore.getFeatureToggles(),
            strategies: StrategyStore.getStrategies(),
            archivedFeatures: ArchiveStore.getArchivedToggles(),
        };
    },

    onFeatureToggleChange () {
        this.setState({
            features: FeatureToggleStore.getFeatureToggles(),
        });
    },

    onStrategiesChange () {
        this.setState({
            strategies: StrategyStore.getStrategies(),
        });
    },

    onArchiveChange () {
        this.setState({
            archivedFeatures: ArchiveStore.getArchivedToggles(),
        });
    },

    componentDidMount () {
        this.unsubscribeFS = FeatureToggleStore.listen(this.onFeatureToggleChange);
        this.unsubscribeSS = StrategyStore.listen(this.onStrategiesChange);
        this.unsubscribeAS = ArchiveStore.listen(this.onArchiveChange);
    },
    componentWillUnmount () {
        this.unsubscribeFS();
        this.unsubscribeSS();
        this.unsubscribeAS();
    },

    componentWillMount () {
        initalizer(30);
    },

    renderLink (id, label) {
        return    (
            <Link to={id} className="nav-element centerify" activeClassName="nav-active">
                <span className="topbar-nav-svg-caption caption showbydefault no-break">{label}</span>
            </Link>
        );
    },

    render () {
        return (
            <div>
                <Menu>
                    {this.renderLink('features',    'Toggles')}
                    {this.renderLink('strategies',  'Strategies')}
                    {this.renderLink('log',         'Log')}
                    {this.renderLink('archive',     'Archive')}
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
    },
});


module.exports = UnleashApp;
