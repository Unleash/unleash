var React   = require('react');
var Unleash = require('./components/Unleash');

React.render(
    <Unleash pollInterval={5000} />,
    document.getElementById('content')
);