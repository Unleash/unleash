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
        this.handleError("Could not load inital strategies from server");
    },

    clearErrors: function() {
        this.setState({errors: []});
    },

    handleError: function(error) {
        var errors = this.state.errors.concat([error]);
        this.setState({errors: errors});
    },

    handleNewStrategy: function() {
        this.setState({createView: true});
    },

    handleCancelNewStrategy: function() {
        this.setState({createView: false});
    },

    handleSave: function(strategy) {
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
        return (<StrategyForm handleCancelNewStrategy={this.handleCancelNewStrategy} handleSave={this.handleSave} />)
    },

    renderCreateButton: function() {
        return (
            <button className="mal" onClick={this.handleNewStrategy}>Create strategy</button>
        );
    }
});

module.exports = StrategiesComponent;