'use strict';

const React                   = require('react');
const Router                  = require('react-router');
const UserStore               = require('./stores/UserStore');
const routes                  = require('./routes');

UserStore.init();

Router.run(routes, Handler => {
    React.render(<Handler/>, document.getElementById('content'));
});
