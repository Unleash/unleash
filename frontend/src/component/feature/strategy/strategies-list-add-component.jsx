import React from 'react';
import PropTypes from 'prop-types';
import arrayMove from 'array-move';

import ConfigureStrategy from './strategy-configure-container';
import AddStrategy from './strategies-add';
import { HeaderTitle } from '../../common';
import DragAndDrop from '../../common/drag-and-drop';
import { updateIndexInArray } from '../../common/util';
import styles from './strategy.module.scss';

const StrategiesList = props => {
    const updateStrategy = index => strategy => {
        const newStrategy = { ...strategy };
        const newStrategies = updateIndexInArray(props.configuredStrategies, index, newStrategy);
        props.saveStrategies(newStrategies);
    };

    const saveStrategy = () => () => {
        // not needed for create flow
    };

    const addStrategy = strategy => {
        const strategies = [...props.configuredStrategies];
        strategies.push({ ...strategy });
        props.saveStrategies(strategies);
    };

    const moveStrategy = async (index, toIndex) => {
        const strategies = arrayMove(props.configuredStrategies, index, toIndex);
        await props.saveStrategies(strategies);
    };

    const removeStrategy = index => async () => {
        props.saveStrategies(props.configuredStrategies.filter((_, i) => i !== index));
    };

    const { strategies, configuredStrategies, featureToggleName } = props;

    const hasName = featureToggleName && featureToggleName.length > 1;

    const blocks = configuredStrategies.map((strategy, i) => (
        <ConfigureStrategy
            index={i}
            key={i}
            featureToggleName={featureToggleName}
            strategy={strategy}
            moveStrategy={moveStrategy}
            removeStrategy={removeStrategy(i)}
            updateStrategy={updateStrategy(i)}
            saveStrategy={saveStrategy(i)}
            strategyDefinition={strategies.find(s => s.name === strategy.name)}
            editable
            movable
        />
    ));
    return (
        <DragAndDrop>
            <div className={styles.strategyListAdd}>
                <HeaderTitle
                    title="Activation strategies"
                    actions={
                        <AddStrategy
                            strategies={strategies}
                            addStrategy={addStrategy}
                            disabled={!hasName}
                            featureToggleName={featureToggleName}
                        />
                    }
                />
                <div className={styles.strategyList}>
                    {blocks.length > 0 ? (
                        blocks
                    ) : (
                        <p style={{ maxWidth: '800px' }}>
                            An activation strategy allows you to control how a feature toggle is enabled in your
                            applications. If you do not specify any activation strategies you will get the "default"
                            strategy.
                        </p>
                    )}
                </div>
            </div>
        </DragAndDrop>
    );
};

StrategiesList.propTypes = {
    strategies: PropTypes.array.isRequired,
    configuredStrategies: PropTypes.array.isRequired,
    featureToggleName: PropTypes.string.isRequired,
    saveStrategies: PropTypes.func,
};

export default StrategiesList;
