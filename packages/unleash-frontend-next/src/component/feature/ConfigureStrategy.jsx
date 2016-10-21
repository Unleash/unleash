import React, { PropTypes } from 'react';
import { Button, Input } from 'react-toolbox';


class ConfigureStrategy extends React.Component {
    constructor () {
        super();
        this.state = {};
    }

    static propTypes () {
        return {
            strategy: PropTypes.object.isRequired,
        };
    }

    addStrategy = (evt) => {
        evt.preventDefault();
    }

    handleChange = (key, value) => {
        const change = {};
        change[key] = value;

        const newState = Object.assign({}, this.state, change);
        this.setState(newState);
    };

    renderInputFields () {
        const strategy = this.props.strategy;
        if (strategy.parametersTemplate) {
            return Object.keys(strategy.parametersTemplate).map(field => (
                <Input key={field} name={field} label={field} onChange={this.handleChange.bind(null, field)} />
            ));
        }
    }


    render () {
        let inputFields = this.renderInputFields();

        return (
            <div style={{ backgroundColor: '#ECECEC', padding: '10px' }}>
                <h4>{this.props.strategy.name}</h4>
                <p>{this.props.strategy.description}</p>
                {inputFields}
                <Button raised label="add strategy" />
                <Button raised accent label="cancel" onClick={this.props.cancelConfig} />
            </div>
        );
    }
}

export default (ConfigureStrategy);
