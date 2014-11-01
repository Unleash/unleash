var React          = require('react'),
    strategyStore  = require('../../stores/StrategyStore');

var StrategyComponent = React.createClass({
    getInitialState: function() {
        return {
            createView: false,
            strategies: []
        };
    },

    componentDidMount: function () {
        strategyStore.getStrategies().then(function(res) {
            this.setState({strategies: res.strategies});
        }.bind(this));
    },

    render: function() {
        return (
            <div>
                <h1>Strategies</h1>
                {JSON.stringify(this.state.strategies)}
            </div>
            );
    }
});

module.exports = StrategyComponent;