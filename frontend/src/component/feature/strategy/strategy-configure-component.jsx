import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardTitle, CardText, CardMenu, IconButton, Icon } from 'react-mdl';
import { Link } from 'react-router-dom';

import FlexibleRolloutStrategy from './flexible-rollout-strategy-container';
import DefaultStrategy from './default-strategy';
import GeneralStrategy from './general-strategy';
import UserWithIdStrategy from './user-with-id-strategy';
import UnknownStrategy from './unknown-strategy';
import LoadingStrategy from './loading-strategy';

import styles from './strategy.module.scss';

import StrategyConstraints from './constraint/strategy-constraint-input-container';

export default class StrategyConfigureComponent extends React.Component {
    /* eslint-enable */
    static propTypes = {
        strategy: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        strategyDefinition: PropTypes.object,
        updateStrategy: PropTypes.func,
        saveStrategy: PropTypes.func,
        removeStrategy: PropTypes.func,
        moveStrategy: PropTypes.func,
        isDragging: PropTypes.bool.isRequired,
        hovered: PropTypes.bool,
        movable: PropTypes.bool,
        connectDragPreview: PropTypes.func.isRequired,
        connectDragSource: PropTypes.func.isRequired,
        connectDropTarget: PropTypes.func.isRequired,
        editable: PropTypes.bool,
    };

    updateParameters = parameters => {
        const { strategy } = this.props;
        const updatedStrategy = { ...strategy, parameters };
        this.props.updateStrategy(updatedStrategy);
    };

    updateConstraints = constraints => {
        const { strategy } = this.props;
        const updatedStrategy = { ...strategy, constraints };
        this.props.updateStrategy(updatedStrategy);
    };

    updateParameter = async (field, value) => {
        const { strategy } = this.props;
        const parameters = { ...strategy.parameters };
        parameters[field] = value;
        this.updateParameters(parameters);
    };

    resolveInputType() {
        const { strategyDefinition } = this.props;
        if (!strategyDefinition) {
            return UnknownStrategy;
        }
        switch (strategyDefinition.name) {
            case 'Loading':
                return LoadingStrategy;
            case 'default':
                return DefaultStrategy;
            case 'flexibleRollout':
                return FlexibleRolloutStrategy;
            case 'userWithId':
                return UserWithIdStrategy;
            default:
                return GeneralStrategy;
        }
    }

    render() {
        const {
            isDragging,
            hovered,
            editable,
            connectDragSource,
            connectDragPreview,
            connectDropTarget,
            strategyDefinition,
            strategy,
            index,
            removeStrategy,
            saveStrategy,
            movable,
        } = this.props;

        const { name, dirty, parameters } = strategy;

        const description = strategyDefinition ? strategyDefinition.description : 'Unknown';
        const InputType = this.resolveInputType(name);

        const cardClasses = [styles.card];
        if (dirty) {
            cardClasses.push('mdl-color--purple-50');
        }
        if (isDragging) {
            cardClasses.push(styles.isDragging);
        }
        if (hovered) {
            cardClasses.push(styles.isDroptarget);
        }

        return connectDragPreview(
            connectDropTarget(
                <div className={styles.item}>
                    <Card shadow={0} className={cardClasses.join(' ')}>
                        <CardTitle className={styles.cardTitle} title={description}>
                            <Icon name="extension" />
                            &nbsp;
                            {name}
                            {dirty ? <small>&nbsp;(Unsaved)</small> : ''}
                        </CardTitle>

                        <CardText style={{ width: 'unset' }}>
                            <StrategyConstraints
                                updateConstraints={this.updateConstraints}
                                constraints={strategy.constraints || []}
                            />
                            <InputType
                                parameters={parameters}
                                strategy={strategy}
                                strategyDefinition={strategyDefinition}
                                updateParameter={this.updateParameter}
                                index={index}
                                editable={editable}
                            />
                            <Button
                                onClick={saveStrategy}
                                accent
                                raised
                                ripple
                                style={{ visibility: dirty ? 'visible' : 'hidden' }}
                            >
                                Save changes
                            </Button>
                        </CardText>

                        <CardMenu className="mdl-color-text--white">
                            <Link
                                title="View strategy"
                                to={`/strategies/view/${name}`}
                                className={styles.editLink}
                                title={description}
                            >
                                <Icon name="info" />
                            </Link>
                            {editable && (
                                <IconButton
                                    title="Remove this activation strategy"
                                    name="delete"
                                    onClick={removeStrategy}
                                />
                            )}
                            {editable &&
                                movable &&
                                connectDragSource(
                                    <span className={styles.reorderIcon}>
                                        <Icon name="reorder" />
                                    </span>
                                )}
                            {editable && !movable && (
                                <span className={[styles.reorderIcon, styles.disabled].join(' ')}>
                                    <Icon name="reorder" title="You can not reorder while editing." />
                                </span>
                            )}
                        </CardMenu>
                    </Card>
                </div>
            )
        );
    }
}
