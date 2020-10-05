import React from 'react';
import PropTypes from 'prop-types';
import {
    Textfield,
    Button,
    Card,
    CardTitle,
    CardText,
    CardActions,
    CardMenu,
    IconButton,
    Icon,
    Switch,
    Tooltip,
} from 'react-mdl';
import { DragSource, DropTarget } from 'react-dnd';
import { Link } from 'react-router-dom';
import flow from 'lodash/flow';
import StrategyInputPercentage from './strategy-input-percentage';
import FlexibleRolloutStrategyInput from './flexible-rollout-strategy-input';
import StrategyInputList from './strategy-input-list';
import styles from './strategy.scss';

const dragSource = {
    beginDrag(props) {
        return {
            id: props.id,
            index: props.index,
        };
    },
    endDrag(props, monitor) {
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
    drop(props) {
        return {
            index: props.index,
        };
    },
};

/**
 * Specifies which props to inject into your component.
 */
function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
    };
}

function collectTarget(connect, monitor) {
    return {
        highlighted: monitor.canDrop(),
        hovered: monitor.isOver(),
        connectDropTarget: connect.dropTarget(),
    };
}

class StrategyConfigure extends React.Component {
    /* eslint-enable */
    static propTypes = {
        strategy: PropTypes.object.isRequired,
        featureToggleName: PropTypes.string.isRequired,
        strategyDefinition: PropTypes.object,
        updateStrategy: PropTypes.func,
        removeStrategy: PropTypes.func,
        moveStrategy: PropTypes.func,
        isDragging: PropTypes.bool.isRequired,
        connectDragPreview: PropTypes.func.isRequired,
        connectDragSource: PropTypes.func.isRequired,
        connectDropTarget: PropTypes.func.isRequired,
    };

    handleConfigChange = (key, e) => {
        this.setConfig(key, e.target.value);
    };

    handleSwitchChange = (key, currentValue) => {
        const value = currentValue === 'false' ? 'true' : 'false';
        this.setConfig(key, value);
    };

    setConfig = (key, value) => {
        const parameters = this.props.strategy.parameters || {};
        parameters[key] = value;

        const updatedStrategy = Object.assign({}, this.props.strategy, {
            parameters,
        });

        this.props.updateStrategy(updatedStrategy);
    };

    handleRemove = evt => {
        evt.preventDefault();
        this.props.removeStrategy();
    };

    renderStrategContent(strategyDefinition) {
        if (strategyDefinition.name === 'default') {
            return <h6>{strategyDefinition.description}</h6>;
        }
        if (strategyDefinition.name === 'flexibleRollout') {
            return (
                <FlexibleRolloutStrategyInput
                    strategy={this.props.strategy}
                    featureToggleName={this.props.featureToggleName}
                    updateStrategy={this.props.updateStrategy}
                    handleConfigChange={this.handleConfigChange.bind(this)}
                />
            );
        } else {
            return <div>{this.renderInputFields(strategyDefinition)}</div>;
        }
    }

    renderInputFields({ parameters }) {
        if (parameters && parameters.length > 0) {
            return parameters.map(({ name, type, description, required }) => {
                let value = this.props.strategy.parameters[name];
                if (type === 'percentage') {
                    if (value == null || (typeof value === 'string' && value === '')) {
                        this.setConfig(name, 50);
                    }
                    return (
                        <div key={name}>
                            <br />
                            <StrategyInputPercentage
                                name={name}
                                onChange={this.handleConfigChange.bind(this, name)}
                                value={1 * value}
                                minLabel="off"
                                maxLabel="on"
                            />
                            {description && <p className={styles.helpText}>{description}</p>}
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
                            <StrategyInputList
                                name={name}
                                list={list}
                                disabled={!this.props.updateStrategy}
                                setConfig={this.setConfig}
                            />
                            {description && <p className={styles.helpText}>{description}</p>}
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
                            {description && <p className={styles.helpText}>{description}</p>}
                        </div>
                    );
                } else if (type === 'boolean') {
                    if (!value) {
                        this.handleSwitchChange(name, value);
                    }
                    return (
                        <div key={name}>
                            <Switch
                                onChange={this.handleSwitchChange.bind(this, name, value)}
                                checked={value === 'true'}
                            >
                                {name}{' '}
                                {description && (
                                    <Tooltip label={description}>
                                        <Icon name="info" style={{ color: 'rgba(0, 0, 0, 0.7)', fontSize: '1em' }} />
                                    </Tooltip>
                                )}
                            </Switch>
                        </div>
                    );
                } else {
                    if (name === 'groupId' && !value) {
                        this.setConfig('groupId', this.props.featureToggleName);
                    }
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
                            {description && <p className={styles.helpText}>{description}</p>}
                        </div>
                    );
                }
            });
        }
        return null;
    }

    render() {
        const { isDragging, connectDragPreview, connectDragSource, connectDropTarget } = this.props;

        let item;
        if (this.props.strategyDefinition) {
            const description = this.props.strategyDefinition.description;
            const strategyContent = this.renderStrategContent(this.props.strategyDefinition);
            const { name } = this.props.strategy;
            item = (
                <Card
                    shadow={0}
                    className={styles.card}
                    style={{ opacity: isDragging ? '0.1' : '1', overflow: 'visible' }}
                >
                    <CardTitle className={styles.cardTitle} title={description}>
                        <Icon name="extension" />
                        &nbsp;
                        {name}
                    </CardTitle>

                    {strategyContent && <CardActions border>{strategyContent}</CardActions>}

                    <CardMenu className="mdl-color-text--white">
                        <Link
                            title="View strategy"
                            to={`/strategies/view/${name}`}
                            className={styles.editLink}
                            title={description}
                        >
                            <Icon name="info" />
                        </Link>
                        {this.props.removeStrategy ? (
                            <IconButton title="Remove strategy from toggle" name="delete" onClick={this.handleRemove} />
                        ) : (
                            <span />
                        )}
                        {connectDragSource(
                            <span className={styles.reorderIcon}>
                                <Icon name="reorder" />
                            </span>
                        )}
                    </CardMenu>
                </Card>
            );
        } else {
            const { name } = this.props.strategy;
            item = (
                <Card shadow={0} className={styles.card}>
                    <CardTitle>"{name}" deleted?</CardTitle>
                    <CardText>
                        The strategy "{name}" does not exist on this server.
                        <Link to={`/strategies/create?name=${name}`}>Want to create it now?</Link>
                    </CardText>
                    <CardActions>
                        <Button onClick={this.handleRemove} label="remove strategy" accent raised>
                            Remove
                        </Button>
                    </CardActions>
                </Card>
            );
        }

        return connectDragPreview(connectDropTarget(<div className={styles.item}>{item}</div>));
    }
}
const type = 'strategy';
export default flow(
    // eslint-disable-next-line new-cap
    DragSource(type, dragSource, collect),
    // eslint-disable-next-line new-cap
    DropTarget(type, dragTarget, collectTarget)
)(StrategyConfigure);
