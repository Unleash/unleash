var React          = require('react'),
    StrategyList   = require('./StrategyList'),
    StrategyForm = require('./StrategyForm'),
    strategyStore  = require('../../stores/StrategyStore'),
    ErrorMessages  = require('../ErrorMessages');

var StrategiesComponent = React.createClass({
    getInitialState: function() {
        return {
            createView: false,
            strategies: [],
            errors: []
        };
    },

    componentDidMount: function () {
        strategyStore.getStrategies().then(function(res) {
            this.setState({strategies: res.strategies});
        }.bind(this), this.initError);
    },

    initError: function() {
        this.onError("Could not load inital strategies from server");
    },

    clearErrors: function() {
        this.setState({errors: []});
    },

    onError: function(error) {
        var errors = this.state.errors.concat([error]);
        this.setState({errors: errors});
    },

    onNewStrategy: function() {
        this.setState({createView: true});
    },

    onCancelNewStrategy: function() {
        this.setState({createView: false});
    },

    onSave: function(strategy) {
        var strategies = this.state.strategies.concat([strategy]);
        this.setState({
            createView: false,
            strategies: strategies
        });
        console.log("Saved strategy: ", strategy);
    },

    render: function() {
        return (
            <div>
                <ErrorMessages errors={this.state.errors} onClearErrors={this.clearErrors} />

                 {this.state.createView ? this.renderCreateView() : this.renderCreateButton()}

                <hr />

                <StrategyList strategies={this.state.strategies} />
            </div>
            );
    },

    renderCreateView: function() {
        return (<StrategyForm onCancelNewStrategy={this.onCancelNewStrategy} onSave={this.onSave} />)
    },

    renderCreateButton: function() {
        return (
            <button className="mal" onClick={this.onNewStrategy}>Create strategy</button>
        );
    }
});

module.exports = StrategiesComponent;