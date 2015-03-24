var React                   = require('react');
var UserStore               = require('./stores/UserStore');
var Menu                    = require('./components/Menu');
var ErrorMessages           = require('./components/ErrorMessages');
var initalizer              = require('./stores/initalizer');
var LogEntriesComponent     = require('./components/log/LogEntriesComponent');
var FeatureTogglesComponent = require('./components/feature/FeatureTogglesComponent');
var StrategiesComponent     = require('./components/strategy/StrategiesComponent');
var ArchiveFeatureComponent = require('./components/feature/ArchiveFeatureComponent');
var Router                  = require('react-router');
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

UserStore.init();

var UnleashApp = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    componentWillMount: function() {
        initalizer(30);
    },

    render: function () {
        return (
            <div>
                <Menu>
                    <Link to="features" className="nav-element centerify" activeClassName="nav-active">
                        <span className="topbar-nav-svg-caption caption showbydefault no-break">Features</span>
                    </Link>
                    <Link to="strategies" className="nav-element centerify" activeClassName="nav-active">
                        <span className="topbar-nav-svg-caption caption showbydefault no-break">Strategies</span>
                    </Link>
                    <Link to="log" className="nav-element centerify" activeClassName="nav-active">
                        <span className="topbar-nav-svg-caption caption showbydefault no-break">Log</span>
                    </Link>
                    <Link to="archive" className="nav-element centerify" activeClassName="nav-active">
                        <span className="topbar-nav-svg-caption caption showbydefault no-break">Archive</span>
                    </Link>
                </Menu>
                <div className="container">
                    <div className="page">
                        <ErrorMessages />
                        <div className="mod shadow mrn pan">
                            <div className="inner pan">
                                <div className="bd">
                                    <RouteHandler/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var routes = (
    <Route name="app" path="/" handler={UnleashApp}>
        <Route name="strategies" handler={StrategiesComponent}/>
        <Route name="log" handler={LogEntriesComponent}/>
        <Route name="archive" handler={ArchiveFeatureComponent}/>
        <DefaultRoute name="features" handler={FeatureTogglesComponent}/>
    </Route>
);

Router.run(routes, function (Handler) {
    React.render(<Handler/>, document.getElementById('content'));
});


module.exports = UnleashApp;
