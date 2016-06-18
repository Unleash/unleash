'use strict';
const React = require('react');
const Strategy = require('./Strategy');

const StrategyList = React.createClass({
    propTypes: {
        strategies: React.PropTypes.array.isRequired
    },

    render() {
        const strategyNodes = this.props.strategies.map(strategy => <Strategy strategy={strategy} key={strategy.name} onRemove={this.props.onRemove} />);
        return (
            <div>{strategyNodes}</div>
            );
    }
});

module.exports = StrategyList;