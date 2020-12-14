import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardTitle, CardText, CardMenu, IconButton, Icon } from 'react-mdl';
import { Link } from 'react-router-dom';

import FlexibleRolloutStrategy from './flexible-rollout-strategy';
import DefaultStrategy from './default-strategy';
import GeneralStrategy from './general-strategy';
import UserWithIdStrategy from './user-with-id-strategy';
import UnknownStrategy from './unknown-strategy';

import styles from './strategy.module.scss';

export default class StrategyConfigureComponent extends React.Component {
    /* eslint-enable */
    static propTypes = {
        strategy: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        strategyDefinition: PropTypes.object,
        updateStrategy: PropTypes.func,
        removeStrategy: PropTypes.func,
        moveStrategy: PropTypes.func,
        isDragging: PropTypes.bool.isRequired,
        hovered: PropTypes.bool,
        connectDragPreview: PropTypes.func.isRequired,
        connectDragSource: PropTypes.func.isRequired,
        connectDropTarget: PropTypes.func.isRequired,
        editable: PropTypes.bool,
    };

    constructor(props) {
        super();
        this.state = {
            constraints: props.strategy.constraints ? [...props.strategy.constraints] : [],
            parameters: { ...props.strategy.parameters },
            edit: false,
            dirty: false,
            index: props.index,
        };
    }

    updateParameters = parameters => {
        const { constraints } = this.state;
        const updatedStrategy = Object.assign({}, this.props.strategy, {
            parameters,
            constraints,
        });
        this.props.updateStrategy(updatedStrategy);
    };

    updateConstraints = constraints => {
        this.setState({ constraints, dirty: true });
    };

    updateParameter = async (field, value, forceUp = false) => {
        const { parameters } = this.state;
        parameters[field] = value;
        if (forceUp) {
            await this.updateParameters(parameters);
            this.setState({ parameters, dirty: false });
        } else {
            this.setState({ parameters, dirty: true });
        }
    };

    onSave = evt => {
        evt.preventDefault();
        const { parameters } = this.state;
        this.updateParameters(parameters);
        this.setState({ edit: false, dirty: false });
    };

    handleRemove = evt => {
        evt.preventDefault();
        this.props.removeStrategy();
    };

    resolveInputType() {
        const { strategyDefinition } = this.props;
        if (!strategyDefinition) {
            return UnknownStrategy;
        }
        switch (strategyDefinition.name) {
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
        const { dirty, parameters } = this.state;
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
        } = this.props;

        const { name } = strategy;

        const description = strategyDefinition ? strategyDefinition.description : 'Uknown';
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

                        <CardText>
                            <InputType
                                parameters={parameters}
                                strategy={strategy}
                                strategyDefinition={strategyDefinition}
                                updateParameter={this.updateParameter}
                                index={index}
                                editable={editable}
                            />
                            <Button
                                onClick={this.onSave}
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
                                    title="Remove strategy from toggle"
                                    name="delete"
                                    onClick={this.handleRemove}
                                />
                            )}
                            {editable &&
                                connectDragSource(
                                    <span className={styles.reorderIcon}>
                                        <Icon name="reorder" />
                                    </span>
                                )}
                        </CardMenu>
                    </Card>
                </div>
            )
        );
    }
}
