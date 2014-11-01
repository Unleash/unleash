var React          = require('react');

var StrategyList = React.createClass({
    propTypes: {
        strategies: React.PropTypes.array.isRequired
    },

    render: function() {
        return (<div>

                {JSON.stringify(this.props.strategies)}
                </div>
            );
    }
});

module.exports = StrategyList;