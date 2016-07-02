'use strict';
const React             = require('react');
const StrategyList      = require('./StrategyList');
const StrategyForm      = require('./StrategyForm');
const StrategyActions   = require('../../stores/StrategyActions');

const StrategiesComponent = React.createClass({
    getInitialState () {
        return {
            createView: false,
        };
    },

    onNewStrategy () {
        this.setState({ createView: true });
    },

    onCancelNewStrategy () {
        this.setState({ createView: false });
    },

    onSave (strategy) {
        StrategyActions.create.triggerPromise(strategy)
        .then(this.onCancelNewStrategy);
    },

    onRemove (strategy) {
        StrategyActions.remove.triggerPromise(strategy);
    },

    render () {
        return (
            <div>
                <h1>Activation Strategies</h1>
                {this.state.createView ?
                    this.renderCreateView() : this.renderCreateButton()}
                <hr />
                <StrategyList
                    strategies={this.props.strategies}
                    onRemove={this.onRemove} />
            </div>
        );
    },

    renderCreateView () {
        return (
            <StrategyForm
                onCancelNewStrategy={this.onCancelNewStrategy}
                onSave={this.onSave}
                />);
    },

    renderCreateButton () {
        return (
                    <button className="mal" onClick={this.onNewStrategy}>
                        Create strategy
                    </button>
                );
    },
});

module.exports = StrategiesComponent;
