var React                   = require('react');
var Router                  = require('react-router');
var UserStore               = require('./stores/UserStore');
var routes                  = require('./routes');

UserStore.init();

Router.run(routes, function (Handler) {
    React.render(<Handler/>, document.getElementById('content'));
});
