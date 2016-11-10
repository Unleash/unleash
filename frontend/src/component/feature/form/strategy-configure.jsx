import React, { PropTypes } from 'react';
import Input from 'react-toolbox/lib/input';
import Button from 'react-toolbox/lib/button';
import { ListItem } from 'react-toolbox/lib/list';

class StrategyConfigure extends React.Component {

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
        const leftActions = [
            <Button key="remove" onClick={this.handleRemove} icon="remove" floating accent mini />,
        ];

        if (!this.props.strategyDefinition) {
            return (
                <ListItem
                    leftActions={leftActions}
                    caption={<span style={{ color: 'red' }}>Strategy "{this.props.strategy.name}" deleted</span>}
                />
            );
        }

        const inputFields = this.renderInputFields(this.props.strategyDefinition) || [];

        return (
            <ListItem leftActions={leftActions}
                caption={this.props.strategy.name}
                legend={this.props.strategyDefinition.description}
                rightActions={inputFields}
            />
        );
    }
}

export default StrategyConfigure;
