import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import cloneDeep from 'lodash.clonedeep';
import arrayMove from 'array-move';
import { Button } from '@material-ui/core';

import { Alert } from '@material-ui/lab';
import HeaderTitle from '../../common/HeaderTitle';
import { updateIndexInArray } from '../../common/util';
import styles from './strategy.module.scss';
import StrategyCard from './StrategyCard';
import EditStrategyModal from './EditStrategyModal/EditStrategyModal';
import ConditionallyRender from '../../common/ConditionallyRender';
import CreateStrategy from './AddStrategy/AddStrategy';
import Dialogue from '../../common/Dialogue/Dialogue';

const cleanStrategy = strategy => ({
    name: strategy.name,
    parameters: cloneDeep(strategy.parameters),
    constraints: cloneDeep(strategy.constraints || []),
});

const StrategiesList = props => {
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [delStrategy, setDelStrategy] = useState(null);
    const [showCreateStrategy, setShowCreateStrategy] = useState(false);
    const [showAlert, setShowAlert] = useState(true);
    const [editableStrategies, updateEditableStrategies] = useState(
        cloneDeep(props.configuredStrategies)
    );
    const [editStrategyIndex, setEditStrategyIndex] = useState();

    useEffect(() => {
        const notEditing = editStrategyIndex < 0;
        if (notEditing) {
            updateEditableStrategies(cloneDeep(props.configuredStrategies));
        }
        /* eslint-disable-next-line */
    }, [props.configuredStrategies]);

    const updateStrategy = index => strategy => {
        const newStrategy = { ...strategy };
        const newStrategies = updateIndexInArray(
            editableStrategies,
            index,
            newStrategy
        );
        updateEditableStrategies(newStrategies);
    };

    const saveStrategy = index => async () => {
        const strategies = [...props.configuredStrategies];
        const strategy = editableStrategies[index];
        const cleanedStrategy = cleanStrategy(strategy);

        if (strategy.new) {
            strategies.push(cleanedStrategy);
        } else {
            strategies[index] = cleanedStrategy;
        }

        // store in server
        await props.saveStrategies(strategies);

        // update local state
        updateStrategy(index)(cleanedStrategy, false);
        setEditStrategyIndex(undefined);
    };

    const addStrategy = strategy => {
        const strategies = [...editableStrategies];
        strategies.push({ ...strategy });
        updateEditableStrategies(strategies);
        setEditStrategyIndex(strategies.length - 1);
    };

    const moveStrategy = async (index, toIndex) => {
        if (!editStrategyIndex) {
            // console.log(`move strategy from ${index} to ${toIndex}`);
            const strategies = arrayMove(editableStrategies, index, toIndex);
            await props.saveStrategies(strategies);
            updateEditableStrategies(strategies);
        }
    };

    const triggerDelDialog = index => {
        setShowDelDialog(true);
        setDelStrategy(index);
    };

    const removeStrategy = async () => {
        const strategy = editableStrategies[delStrategy];

        if (!strategy.new) {
            await props.saveStrategies(
                props.configuredStrategies.filter((_, i) => i !== delStrategy)
            );
        }
        updateEditableStrategies(
            editableStrategies.filter((_, i) => i !== delStrategy)
        );

        setDelStrategy(undefined);
        setShowDelDialog(null);
    };

    const clearAll = () => {
        updateEditableStrategies(cloneDeep(props.configuredStrategies));
        setEditStrategyIndex(undefined);
    };

    const {
        strategies,
        configuredStrategies,
        featureToggleName,
        editable,
    } = props;

    const resolveStrategyDefinition = strategyName => {
        if (!strategies || strategies.length === 0) {
            return { name: 'Loading' };
        }
        return strategies.find(s => s.name === strategyName);
    };

    const cards = editableStrategies.map((strategy, i) => (
        <StrategyCard
            key={i}
            strategy={strategy}
            strategyDefinition={resolveStrategyDefinition(strategy.name)}
            removeStrategy={() => triggerDelDialog(i)}
            moveStrategy={moveStrategy}
            editStrategy={() => setEditStrategyIndex(i)}
            index={i}
            movable
        />
    ));

    const editingStrategy = editableStrategies[editStrategyIndex];

    return (
        <div>
            <CreateStrategy
                strategies={strategies}
                showCreateStrategy={showCreateStrategy}
                setShowCreateStrategy={setShowCreateStrategy}
                featureToggleName={featureToggleName}
                addStrategy={addStrategy}
            />
            {editingStrategy ? (
                <EditStrategyModal
                    strategy={editingStrategy}
                    updateStrategy={updateStrategy(editStrategyIndex)}
                    saveStrategy={saveStrategy(editStrategyIndex)}
                    strategyDefinition={resolveStrategyDefinition(
                        editingStrategy.name
                    )}
                    onCancel={clearAll}
                />
            ) : null}
            <ConditionallyRender
                condition={editable}
                show={
                    <HeaderTitle
                        title="Activation strategies"
                        actions={
                            <>
                                <Button
                                    variant="contained"
                                    disabled={!featureToggleName}
                                    color="primary"
                                    onClick={() => setShowCreateStrategy(true)}
                                >
                                    Add strategy
                                </Button>
                            </>
                        }
                    />
                }
            />
            <ConditionallyRender
                condition={showAlert}
                show={
                    <Alert
                        severity="info"
                        className={styles.infoCard}
                        onClose={() => setShowAlert(false)}
                    >
                        <div style={{ maxWidth: '800px' }}>
                            Activation strategies defines how you enable the new
                            feature to your users. Changes to the activation
                            strategies does not require redeployment of the
                            code.
                            <br />
                            <br />
                            Multiple activation strategies are composable blocks
                            that is executed in an OR fashion.
                            <br />
                            E.g. A gradual rollout activation strategy allows
                            you to gradually enable to feature to a subset of
                            your users without redeploy to production.
                        </div>
                    </Alert>
                }
            />
            <ConditionallyRender
                condition={
                    !configuredStrategies || configuredStrategies.length === 0
                }
                show={
                    <p style={{ padding: '0 16px' }}>
                        <i>No activation strategies selected.</i>
                    </p>
                }
            />

            <Dialogue
                title="Really delete strategy?"
                open={showDelDialog}
                onClick={() => removeStrategy()}
                onClose={() => {
                    setDelStrategy(null);
                    setShowDelDialog(false);
                }}
            />
            <ConditionallyRender
                condition={cards.length > 0}
                show={<div className={styles.strategyListCards}>{cards}</div>}
            />
        </div>
    );
};

StrategiesList.propTypes = {
    strategies: PropTypes.array.isRequired,
    configuredStrategies: PropTypes.array.isRequired,
    featureToggleName: PropTypes.string.isRequired,
    saveStrategies: PropTypes.func,
    editable: PropTypes.bool,
};

export default StrategiesList;
