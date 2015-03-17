var React          = require('react');
var StrategyList   = require('./StrategyList');
var StrategyForm   = require('./StrategyForm');
var strategyStore  = require('../../stores/StrategyStore');
var ErrorActions   = require('../../stores/ErrorActions');

var StrategiesComponent = React.createClass({
    getInitialState: function() {
        return {
            createView: false,
            strategies: []
        };
    },

    componentDidMount: function () {
        this.fetchStrategies();
    },

    fetchStrategies: function() {
        strategyStore.getStrategies()
        .then(function(res) {
            this.setState({strategies: res.strategies});
        }.bind(this))
        .catch(this.initError);

    },

    initError: function() {
        this.onError("Could not load inital strategies from server");
    },

    onError: function(error) {
        ErrorActions.error(error);
    },

    onNewStrategy: function() {
        this.setState({createView: true});
    },

    onCancelNewStrategy: function() {
        this.setState({createView: false});
    },

    onSave: function(strategy) {
        function handleSuccess() {
            var strategies = this.state.strategies.concat([strategy]);

            this.setState({
                createView: false,
                strategies: strategies
            });

            console.log("Saved strategy: ", strategy);
        }

        strategyStore.createStrategy(strategy)
        .then(handleSuccess.bind(this))
        .catch(this.onError);
    },

    onRemove: function(strategy) {
        strategyStore.removeStrategy(strategy)
        .then(this.fetchStrategies)
        .catch(this.onError);
    },

    render: function() {
        return (
            <div>
                {this.state.createView ? this.renderCreateView() : this.renderCreateButton()}
                <hr />
                <StrategyList
                    strategies={this.state.strategies}
                    onRemove={this.onRemove} />
            </div>
        );
    },

    renderCreateView: function() {
        return (
            <StrategyForm
                onCancelNewStrategy={this.onCancelNewStrategy}
                onSave={this.onSave}
                />);
    },

    renderCreateButton: function() {
        return (
            <button className="mal" onClick={this.onNewStrategy}>
                Create strategy
            </button>
        );
    }
});

module.exports = StrategiesComponent;
