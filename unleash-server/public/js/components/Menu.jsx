var React = require('react');

var Menu = React.createClass({
    render: function() { return (
            <nav className='navbar navbar-default' role='navigation'>
                <div className='container'>
                    <a className='navbar-brand' href='#'>unleash admin</a>
                </div>
            </nav>
        );
    }
});

module.exports = Menu;