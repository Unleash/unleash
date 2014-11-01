var React          = require('react');

var Strategy = React.createClass({
    propTypes: {
        strategy: React.PropTypes.object.isRequired
    },

    render: function() {
        return (
            <div className="line mal">
                <div className="unit r-size1of3">
                    {this.props.strategy.name}
                </div>
            </div>
        );
    }
});

module.exports = Strategy;