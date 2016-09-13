import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import App from './App';
import Features from './Features';
import Strategies from './Strategies';

ReactDOM.render((
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <Route path="/features" component={Features} />
            <Route path="/strategies" component={Strategies} />
            <Route path="/log" component={Strategies} />
            <Route path="/archive" component={Strategies} />
        </Route>
    </Router>
), document.getElementById('app'));
