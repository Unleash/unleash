import React, { PropTypes } from 'react';
import {
    Textfield, Button,
    Card, CardTitle, CardText, CardActions, CardMenu,
    IconButton, Icon,
} from 'react-mdl';
import { DragSource, DropTarget } from 'react-dnd';
import { Link } from 'react-router';
import StrategyInputPercentage from './strategy-input-percentage';
import StrategyInputList from './strategy-input-list';

const style = {
    flex: '1',
    minWidth: '300px',
    maxWidth: '100%',
    margin: '5px 20px 15px 0px',
};

const helpText = {
    color: 'rgba(0,0,0, 0.54)',
    fontSize: '12px',
    lineHeight: '14px',
};


const dragSource = {
    beginDrag (props) {
        return {
            id: props.id,
            index: props.index,
        };
    },
    endDrag (props, monitor) {
        if (!monitor.didDrop()) {
            return;
        }
        const result = monitor.getDropResult();
        if (typeof result.index === 'number' && props.index !== result.index) {
            props.moveStrategy(props.index, result.index);
        }
    },
};

const dragTarget = {
    drop (props) {
        return {
            index: props.index,
        };
    },
};

@DropTarget('strategy', dragTarget, connect => ({ // eslint-disable-line new-cap
    connectDropTarget: connect.dropTarget(),
}))
@DragSource('strategy', dragSource, (connect, monitor) => ({ // eslint-disable-line new-cap
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
}))
class StrategyConfigure extends React.Component {

    static propTypes () {
        return {
            strategy: PropTypes.object.isRequired,
            strategyDefinition: PropTypes.object.isRequired,
            updateStrategy: PropTypes.func.isRequired,
            removeStrategy: PropTypes.func.isRequired,
            moveStrategy: PropTypes.func.isRequired,
            isDragging: PropTypes.bool.isRequired,
            connectDragPreview: PropTypes.func.isRequired,
            connectDragSource: PropTypes.func.isRequired,
            connectDropTarget: PropTypes.func.isRequired,
        };
    }

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
                            <StrategyInputPercentage
                                name={name}
                                onChange={this.handleConfigChange.bind(this, name)}
                                value={1 * value} />
                            {description && <p style={helpText}>{description}</p>}
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
                            {description && <p style={helpText}>{description}</p>}
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
                            {description && <p style={helpText}>{description}</p>}
                        </div>
                    );
                } else {
                    return (
                        <div key={name}>
                            <Textfield
                                floatingLabel
                                rows={1}
                                style={{ width: '100%' }}
                                required={required}
                                name={name}
                                label={name}
                                onChange={this.handleConfigChange.bind(this, name)}
                                value={value}
                                />
                            {description && <p style={helpText}>{description}</p>}
                        </div>
                    );
                }
            });
        }
        return null;
    }

    render () {
        const { isDragging, connectDragPreview, connectDragSource, connectDropTarget } = this.props;

        let item;
        if (this.props.strategyDefinition) {
            const inputFields = this.renderInputFields(this.props.strategyDefinition);
            const { name } = this.props.strategy;
            item = (
                <Card shadow={0} style={{ background: '#f2f9fc', width: '100%', display: 'block', opacity: isDragging ? '0.1' : '1' }}>
                    <CardTitle style={{ color: '#fff', height: '65px', background: '#607d8b' }}>
                        <Icon name="extension" />&nbsp;{name}
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
                            title="View strategy"
                            to={`/strategies/view/${name}`}
                            style={{ color: '#fff', display: 'inline-block', verticalAlign: 'bottom', marginRight: '5px' }}>
                            <Icon name="link" />
                        </Link>
                        <IconButton title="Remove strategy from toggle" name="delete" onClick={this.handleRemove} />
                        {connectDragSource(
                            <span style={{
                                cursor: 'pointer',
                                display: 'inline-block',
                                verticalAlign: 'bottom',
                            }}><Icon name="reorder" /></span>)}
                    </CardMenu>
                </Card>
            );
        } else {
            const { name } = this.props.strategy;
            item = (
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

        return (connectDropTarget(connectDragPreview(
            <div style={style}>{item}</div>
        )));
    }
}

export default StrategyConfigure;
