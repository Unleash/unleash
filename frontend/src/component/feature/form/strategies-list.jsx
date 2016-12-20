import React, { PropTypes } from 'react';
import ConfigureStrategy from './strategy-configure';

class StrategiesList extends React.Component {

    static propTypes () {
        return {
            strategies: PropTypes.array.isRequired,
            configuredStrategies: PropTypes.array.isRequired,
            updateStrategy: PropTypes.func.isRequired,
            removeStrategy: PropTypes.func.isRequired,
        };
    }

    render () {
        const {
            strategies,
            configuredStrategies,
        } = this.props;

        if (!configuredStrategies || configuredStrategies.length === 0) {
            return <i style={{ color: 'red' }}>No strategies added</i>;
        }

        const blocks = configuredStrategies.map((strategy, i) => (
            <ConfigureStrategy
                key={`${strategy.name}-${i}`}
                strategy={strategy}
                removeStrategy={this.props.removeStrategy.bind(null, i)}
                updateStrategy={this.props.updateStrategy.bind(null, i)}
                strategyDefinition={strategies.find(s => s.name === strategy.name)} />
        ));
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {blocks}
            </div>
        );
    }
}

export default StrategiesList;
