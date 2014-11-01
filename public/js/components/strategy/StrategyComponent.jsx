var React          = require('react'),
    StrategyList   = require('./StrategyList'),
    CreateStrategy = require('./CreateStrategy'),
    strategyStore  = require('../../stores/StrategyStore'),
    ErrorMessages  = require('../ErrorMessages');

var StrategyComponent = React.createClass({
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
        return (<CreateStrategy handleCancelNewStrategy={this.handleCancelNewStrategy} />)
    },

    renderCreateButton: function() {
        return (
            <p className="">
                <button className="" onClick={this.handleNewStrategy}>Create strategy</button>
            </p>
            );
    }
});

module.exports = StrategyComponent;