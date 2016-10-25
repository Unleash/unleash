import React, { PropTypes } from 'react';
import { Button, Input } from 'react-toolbox';

class ConfigureStrategies extends React.Component {

    static propTypes () {
        return {
            strategy: PropTypes.object.isRequired,
            strategyDefinition: PropTypes.object.isRequired,
            updateStrategy: PropTypes.func.isRequired,
            removeStrategy: PropTypes.func.isRequired,
        };
    }

    updateStrategy = (evt) => {
        evt.preventDefault();
        this.props.updateStrategy({
            name: this.state.selectedStrategy.name,
            parameters: this.state.parameters,
        });
    };

    handleConfigChange = (key, value) => {
        const parameters = {};
        parameters[key] = value;

        const updatedStrategy = Object.assign({}, this.props.strategy, { parameters });

        this.props.updateStrategy(this.props.strategy, updatedStrategy);
    };

    handleRemove = (evt) => {
        evt.preventDefault();
        this.props.removeStrategy(this.props.strategy);
    }

    renderInputFields (strategyDefinition) {
        if (strategyDefinition.parametersTemplate) {
            return Object.keys(strategyDefinition.parametersTemplate).map(field => (
                <Input
                    type="text"
                    key={field}
                    name={field}
                    label={field}
                    onChange={this.handleConfigChange.bind(this, field)}
                    value={this.props.strategy.parameters[field]}
                />
            ));
        }
    }

    render () {
        const inputFields = this.renderInputFields(this.props.strategyDefinition);
        return (
            <div>
                <strong>{this.props.strategy.name}</strong>
                <Button title="Remove Strategy" onClick={this.handleRemove} icon="remove" floating accent mini />
                <p><i>{this.props.strategyDefinition.description}</i></p>
                {inputFields}
            </div>
        );
    }
}

export default ConfigureStrategies;
