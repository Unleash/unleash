import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Typography,
} from '@material-ui/core';

import CreateStrategyCard from './AddStrategyCard/AddStrategyCard';
import { useStyles } from './AddStrategy.styles';
import ConditionallyRender from '../../../common/ConditionallyRender';
import { resolveDefaultParamValue } from './utils';
import { getHumanReadbleStrategy } from '../../../../utils/strategy-names';

const AddStrategy = ({
    strategies,
    showCreateStrategy,
    setShowCreateStrategy,
    featureToggleName,
    addStrategy,
}) => {
    const styles = useStyles();
    if (!strategies) return null;

    const builtInStrategies = strategies
        .filter(strategy => strategy.editable !== true)
        .filter(strategy => !strategy.deprecated);

    const customStrategies = strategies
        .filter(strategy => !strategy.deprecated)
        .filter(strategy => strategy.editable);

    const setStrategyByName = strategyName => {
        const selectedStrategy = strategies.find(s => s.name === strategyName);
        const parameters = {};

        selectedStrategy.parameters.forEach(({ name }) => {
            parameters[name] = resolveDefaultParamValue(
                name,
                featureToggleName
            );
        });

        addStrategy({
            name: selectedStrategy.name,
            parameters,
        });
    };

    const orderStrategies = strategies => {
        const order = [
            'default',
            'flexibleRollout',
            'userWithId',
            'remoteAddress',
            'applicationHostname',
        ];
        const temp = [...strategies];
        const result = [];

        while (order.length > 0) {
            const matchValue = order[0];
            temp.forEach(value => {
                if (value.name === matchValue) {
                    result.push(value);
                }
            });
            order.shift();
        }
        return result;
    };

    const renderBuiltInStrategies = () =>
        orderStrategies(builtInStrategies).map(strategy => (
            <CreateStrategyCard
                strategy={getHumanReadbleStrategy(strategy.name)}
                key={strategy.name}
                onClick={() => {
                    setShowCreateStrategy(false);
                    setStrategyByName(strategy.name);
                }}
            />
        ));

    const renderCustomStrategies = () =>
        customStrategies.map(strategy => (
            <CreateStrategyCard
                strategy={strategy}
                key={strategy.name}
                onClick={() => {
                    setShowCreateStrategy(false);
                    setStrategyByName(strategy.name);
                }}
            />
        ));

    return (
        <Dialog
            open={showCreateStrategy}
            aria-labelledby="form-dialog-title"
            fullWidth
            maxWidth="md"
        >
            <DialogTitle id="form-dialog-title">Add a new strategy</DialogTitle>

            <DialogContent>
                <Typography variant="subtitle1" className={styles.subTitle}>
                    Built in strategies
                </Typography>
                <div className={styles.createStrategyCardContainer}>
                    {renderBuiltInStrategies()}
                </div>

                <ConditionallyRender
                    condition={customStrategies.length > 0}
                    show={
                        <>
                            <Typography
                                variant="subtitle1"
                                className={styles.subTitle}
                            >
                                Custom strategies
                            </Typography>
                            <div className={styles.createStrategyCardContainer}>
                                {renderCustomStrategies()}
                            </div>
                        </>
                    }
                />
            </DialogContent>

            <DialogActions>
                <Button
                    color="secondary"
                    onClick={() => setShowCreateStrategy(false)}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

AddStrategy.propTypes = {
    strategies: PropTypes.array.isRequired,
    showCreateStrategy: PropTypes.bool.isRequired,
    setShowCreateStrategy: PropTypes.func.isRequired,
    featureToggleName: PropTypes.string.isRequired,
    addStrategy: PropTypes.func.isRequired,
};

export default AddStrategy;
