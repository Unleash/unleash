import React, { PropTypes } from 'react';
import {
    Textfield, Button,
    Card, CardTitle, CardText, CardActions, CardMenu,
    IconButton, Icon,
}  from 'react-mdl';
import { Link } from 'react-router';
import StrategyInputPersentage from './strategy-input-persentage';
import StrategyInputList from './strategy-input-list';

const style = {
    flex: '1',
    minWidth: '300px',
    maxWidth: '100%',
    margin: '5px 20px 15px 0px',
};
class StrategyConfigure extends React.Component {

    static propTypes () {
        return {
            strategy: PropTypes.object.isRequired,
            strategyDefinition: PropTypes.object.isRequired,
            updateStrategy: PropTypes.func.isRequired,
            removeStrategy: PropTypes.func.isRequired,
        };
    }

    // shouldComponentUpdate (props, nextProps) {
    //     console.log({ props, nextProps });
    // }

    handleConfigChange = (key, e) => {
        this.setConfig(key, e.target.value);
    };

    setConfig = (key, value) => {
        const parameters = this.props.strategy.parameters || {};
        parameters[key] = value;

        const updatedStrategy = Object.assign({}, this.props.strategy, { parameters });

        this.props.updateStrategy(updatedStrategy);
    }

    handleRemove = (evt) => {
        evt.preventDefault();
        this.props.removeStrategy();
    }

    renderInputFields ({ parameters }) {
        if (parameters && parameters.length > 0) {
            return parameters.map(({ name, type, description, required }) => {
                let value = this.props.strategy.parameters[name];
                if (type === 'percentage') {
                    if (value == null || (typeof value === 'string' && value === '')) {
                        value = 50; // default value
                    }
                    return (
                        <div key={name}>
                            <StrategyInputPersentage
                                name={name}
                                onChange={this.handleConfigChange.bind(this, name)}
                                value={1 * value} />
                            {description && <p>{description}</p>}
                        </div>
                    );
                } else if (type === 'list') {
                    let list = [];
                    if (typeof value === 'string') {
                        list = value
                            .trim()
                            .split(',')
                            .filter(Boolean);
                    }
                    return (
                        <div key={name}>
                            <StrategyInputList name={name} list={list} setConfig={this.setConfig} />
                            {description && <p>{description}</p>}
                        </div>
                    );
                } else if (type === 'number') {
                    return (
                        <div key={name}>
                            <Textfield
                                pattern="-?[0-9]*(\.[0-9]+)?"
                                error={`${name} is not a number!`}
                                floatingLabel
                                required={required}
                                style={{ width: '100%' }}
                                name={name}
                                label={name}
                                onChange={this.handleConfigChange.bind(this, name)}
                                value={value}
                            />
                            {description && <p>{description}</p>}
                        </div>
                    );
                } else {
                    return (
                        <div key={name}>
                            <Textfield
                                floatingLabel
                                rows={2}
                                style={{ width: '100%' }}
                                required={required}
                                name={name}
                                label={name}
                                onChange={this.handleConfigChange.bind(this, name)}
                                value={value}
                            />
                            {description && <p>{description}</p>}
                        </div>
                    );
                }
            });
        }
        return null;
    }

    render () {
        if (!this.props.strategyDefinition) {
            const { name } = this.props.strategy;
            return (
                <Card shadow={0} style={style}>
                    <CardTitle>"{name}" deleted?</CardTitle>
                    <CardText>
                        The strategy "{name}" does not exist on this server.
                        <Link to={`/strategies/create?name=${name}`}>Want to create it now?</Link>
                    </CardText>
                    <CardActions>
                        <Button onClick={this.handleRemove} label="remove strategy" accent raised>Remove</Button>
                    </CardActions>

                </Card>
            );
        }

        const inputFields = this.renderInputFields(this.props.strategyDefinition);

        const { name } = this.props.strategy;

        return (
            <Card shadow={0} style={style}>
                <CardTitle style={{ color: '#fff', height: '65px', background: '#607d8b' }}>
                    { name }
                </CardTitle>
                <CardText>
                    {this.props.strategyDefinition.description}
                </CardText>
                {
                    inputFields && <CardActions border style={{ padding: '20px' }}>
                        {inputFields}
                    </CardActions>
                }

                <CardMenu style={{ color: '#fff' }}>
                    <Link
                        title="View / Edit stratgy"
                        to={`/strategies/view/${name}`}
                        style={{ color: '#fff', display: 'inline-block', verticalAlign: 'bottom', marginRight: '5px' }}>
                        <Icon name="edit" />
                    </Link>
                    <IconButton title="Remove strategy from toggle" name="delete" onClick={this.handleRemove} />
                </CardMenu>
            </Card>
        );
    }
}

export default StrategyConfigure;
