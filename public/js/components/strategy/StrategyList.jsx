var React = require('react'),
    Strategy = require('./Strategy');

var StrategyList = React.createClass({
    propTypes: {
        strategies: React.PropTypes.array.isRequired
    },

    render: function() {
        var strategyNodes = this.props.strategies.map(function(strategy) {
            return <Strategy strategy={strategy} />;
        });
        return (
            <div>{strategyNodes}</div>
            );
    }
});

module.exports = StrategyList;