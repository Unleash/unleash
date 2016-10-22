import React, { PropTypes } from 'react';
import { Button, Input } from 'react-toolbox';

class ConfigureStrategy extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            selectedStrategy: props.strategies[0],
            parameters: {},
        };
    }

    static propTypes () {
        return {
            strategies: PropTypes.array.isRequired,
            cancelConfig: PropTypes.func.isRequired,
            addStrategy: PropTypes.func.isRequired,
        };
    }

    handleChange = (evt) => {
        const strategyName = evt.target.value;
        const selectedStrategy = this.props.strategies.find(s => s.name === strategyName);
        this.setState({ selectedStrategy, parameters: {} });
    }

    addStrategy = (evt) => {
        evt.preventDefault();
        this.props.addStrategy({
            name: this.state.selectedStrategy.name,
            parameters: this.state.parameters,
        });
    };

    handleConfigChange = (key, value) => {
        const parameters = this.state.parameters;
        parameters[key] = value;
        this.setState({ parameters });
    };

    renderInputFields (selectedStrategy) {
        if (selectedStrategy.parametersTemplate) {
            return Object.keys(selectedStrategy.parametersTemplate).map(field => (
                <Input
                    type="text"
                    key={field}
                    name={field}
                    label={field}
                    onChange={this.handleConfigChange.bind(this, field)}
                    value={this.state.parameters[field]}
                />
            ));
        }
    }

    render () {
        const strategies = this.props.strategies.map(s => (
            <option key={s.name} value={s.name}>{s.name}</option>
        ));

        const style = {
            backgroundColor: '#ECE',
            padding: '10px',
        };

        const selectedStrategy = this.state.selectedStrategy;

        return (
            <div style={style}>
                <select value={selectedStrategy.name} onChange={this.handleChange}>
                    {strategies}
                </select>

                <p><strong>Description:</strong> {selectedStrategy.description}</p>

                {this.renderInputFields(selectedStrategy)}

                <Button icon="add" accent label="add strategy" onClick={this.addStrategy} />
                <Button label="cancel" onClick={this.props.cancelConfig} />
            </div>
        );
    }
}

export default ConfigureStrategy;
