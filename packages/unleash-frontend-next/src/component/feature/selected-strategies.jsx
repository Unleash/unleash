import React, { PropTypes } from 'react';
import { Avatar, Chip } from 'react-toolbox';

class SelectedStrategies extends React.Component {
    static propTypes () {
        return {
            configuredStrategies: PropTypes.array.isRequired,
            removeStrategy: PropTypes.func.isRequired,
        };
    }

    renderName (strategy) {
        const parameters = strategy.parameters || {};
        const params = Object.keys(parameters)
            .map(param => `${param}="${strategy.parameters[param]}"`)
            .join('; ');
        return <span>{strategy.name} ({params})</span>;
    }

    render () {
        const removeStrategy = this.props.removeStrategy;
        const configuredStrategies = this.props.configuredStrategies.map((s, index) => (
            <Chip
                key={`${index}-${s.name}`}
                deletable
                onDeleteClick={() => removeStrategy(s)}
            >
                <Avatar icon="edit" />
                {this.renderName(s)}
            </Chip>
        ));
        return (
            <div>
                {configuredStrategies.length > 0 ? configuredStrategies : <p>No activation strategies added</p>}
            </div>
        );
    }
}

export default SelectedStrategies;
