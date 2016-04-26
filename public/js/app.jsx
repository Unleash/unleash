import React from 'react'
import { Router } from 'react-router'
import { Routes } from './routes'
import UserStore from './stores/UserStore'

UserStore.init();

Router.run(routes, function (Handler) {
    React.render(<Handler/>, document.getElementById('content'));
});
