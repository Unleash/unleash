var React             = require('react');
var StrategyList      = require('./StrategyList');
var StrategyForm      = require('./StrategyForm');
var StrategyActions   = require('../../stores/StrategyActions');

var StrategiesComponent = React.createClass({
    getInitialState: function() {
        return {
            createView: false
        };
    },

    onNewStrategy: function() {
        this.setState({createView: true});
    },

    onCancelNewStrategy: function() {
        this.setState({createView: false});
    },

    onSave: function(strategy) {
        StrategyActions.create.triggerPromise(strategy)
        .then(this.onCancelNewStrategy);
    },

    onRemove: function(strategy) {
        StrategyActions.remove.triggerPromise(strategy);
    },

    render: function() {
        return (
            <div>
                {this.state.createView ?
                    this.renderCreateView() : this.renderCreateButton()}
                <hr />
                <StrategyList
                    strategies={this.props.strategies}
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
