import React, { PropTypes } from 'react';
import Input from 'react-toolbox/lib/input';
import Button from 'react-toolbox/lib/button';

class StrategyConfigure extends React.Component {

    static propTypes () {
        return {
            strategy: PropTypes.object.isRequired,
            strategyDefinition: PropTypes.object.isRequired,
            updateStrategy: PropTypes.func.isRequired,
            removeStrategy: PropTypes.func.isRequired,
        };
    }

    handleConfigChange = (key, value) => {
        const parameters = this.props.strategy.parameters || {};
        parameters[key] = value;

        const updatedStrategy = Object.assign({}, this.props.strategy, { parameters });

        this.props.updateStrategy(updatedStrategy);
    };

    handleRemove = (evt) => {
        evt.preventDefault();
        this.props.removeStrategy();
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
        if (!this.props.strategyDefinition) {
            return (
                <div>
                    <h6><span style={{ color: 'red' }}>Strategy "{this.props.strategy.name}" deleted</span></h6>
                    <Button onClick={this.handleRemove} icon="remove" label="remove strategy" flat/>
                </div>
            );
        }

        const inputFields = this.renderInputFields(this.props.strategyDefinition) || [];

        return (
            <div style={{ padding: '5px 15px', backgroundColor: '#f7f8ff', marginBottom: '10px' }}>
                <h6>
                    <strong>{this.props.strategy.name} </strong>
                    (<a style={{ color: '#ff4081' }} onClick={this.handleRemove} href="#remove-strat">remove</a>)
                </h6>
                <small>{this.props.strategyDefinition.description}</small>
                <div>
                    {inputFields}
                </div>
            </div>
        );
    }
}

export default StrategyConfigure;
