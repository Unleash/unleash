import React, { PropTypes } from 'react';
import { Textfield, Button, Card, CardTitle, CardText, CardActions, CardMenu, IconButton }  from 'react-mdl';

class StrategyConfigure extends React.Component {

    static propTypes () {
        return {
            strategy: PropTypes.object.isRequired,
            strategyDefinition: PropTypes.object.isRequired,
            updateStrategy: PropTypes.func.isRequired,
            removeStrategy: PropTypes.func.isRequired,
        };
    }

    handleConfigChange = (key, e) => {
        const parameters = this.props.strategy.parameters || {};
        parameters[key] = e.target.value;

        const updatedStrategy = Object.assign({}, this.props.strategy, { parameters });

        this.props.updateStrategy(updatedStrategy);
    };

    handleRemove = (evt) => {
        evt.preventDefault();
        this.props.removeStrategy();
    }

    renderInputFields (strategyDefinition) {
        if (strategyDefinition.parametersTemplate) {
            const keys = Object.keys(strategyDefinition.parametersTemplate);
            if (keys.length === 0) {
                return null;
            }
            return keys.map(field => (
                <Textfield
                    floatingLabel
                    rows={2}
                    style={{ width: '100%' }}
                    key={field}
                    name={field}
                    label={field}
                    onChange={this.handleConfigChange.bind(this, field)}
                    value={this.props.strategy.parameters[field]}
                />
            ));
        }
        return null;
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

        const inputFields = this.renderInputFields(this.props.strategyDefinition);

        const { name } = this.props.strategy;

        return (
            <Card shadow={0} style={{
                flex: '1',
                minWidth: '300px',
                maxWidth: '100%',
                // flexBasis: '1',
                margin: '5px 20px 15px 0px',
            }}>
                <CardTitle style={{ color: '#fff', height: '65px', background: '#607d8b' }}>
                    { name }
                </CardTitle>
                <CardText>
                    {this.props.strategyDefinition.description}
                </CardText>
                {
                    inputFields && <CardActions border >
                        {inputFields}
                    </CardActions>
                }

                <CardMenu style={{ color: '#fff' }}>
                    <IconButton name="delete" onClick={this.handleRemove} />
                </CardMenu>
            </Card>
        );
    }
}

export default StrategyConfigure;
