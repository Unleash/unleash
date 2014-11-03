var React          = require('react');

var Strategy = React.createClass({
    propTypes: {
        strategy: React.PropTypes.object.isRequired
    },

    render: function() {
        return (
            <div className="line mal">
                <div className="unit">
                    <strong>{this.props.strategy.name}</strong><br />
                    <em>{this.props.strategy.description}</em>
                </div>
            </div>
        );
    }
});

module.exports = Strategy;