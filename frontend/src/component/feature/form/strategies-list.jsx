import React, { PropTypes } from 'react';
import ConfigureStrategy from './strategy-configure';
import { List } from 'react-toolbox/lib/list';


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

        const blocks = configuredStrategies.map((strat, i) => (
            <ConfigureStrategy
                key={`${strat.name}-${i}`}
                strategy={strat}
                removeStrategy={this.props.removeStrategy}
                updateStrategy={this.props.updateStrategy}
                strategyDefinition={strategies.find(s => s.name === strat.name)} />
        ));
        return (
            <div>
                {blocks}
            </div>
        );
    }
}

export default StrategiesList;
