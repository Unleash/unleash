import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
} from '@material-ui/core';

import FlexibleStrategy from './FlexibleStrategy';
import DefaultStrategy from './default-strategy';
import UserWithIdStrategy from './user-with-id-strategy';
import GeneralStrategy from './general-strategy';
import StrategyConstraints from '../StrategyConstraint/StrategyConstraintInput';

import { getHumanReadbleStrategyName } from '../../../../utils/strategy-names';

const EditStrategyModal = ({
    onCancel,
    strategy,
    saveStrategy,
    updateStrategy,
    strategyDefinition,
}) => {
    const updateParameters = parameters => {
        const updatedStrategy = { ...strategy, parameters };
        updateStrategy(updatedStrategy);
    };

    const updateConstraints = constraints => {
        const updatedStrategy = { ...strategy, constraints };
        updateStrategy(updatedStrategy);
    };

    const updateParameter = async (field, value) => {
        const parameters = { ...strategy.parameters };
        parameters[field] = value;
        updateParameters(parameters);
    };

    const resolveInputType = () => {
        switch (strategyDefinition.name) {
            case 'default':
                return DefaultStrategy;
            case 'flexibleRollout':
                return FlexibleStrategy;
            case 'userWithId':
                return UserWithIdStrategy;
            default:
                return GeneralStrategy;
        }
    };

    const Type = resolveInputType();

    const { parameters } = strategy;

    return (
        <Dialog
            open={!!strategy}
            aria-labelledby="form-dialog-title"
            fullWidth
            maxWidth="md"
        >
            <DialogTitle id="form-dialog-title">
                Configure {getHumanReadbleStrategyName(strategy.name)} strategy
            </DialogTitle>
            <DialogContent>
                <div>
                    <StrategyConstraints
                        updateConstraints={updateConstraints}
                        constraints={strategy.constraints || []}
                    />
                </div>

                <br />
                <br />
                <Type
                    parameters={parameters}
                    updateParameter={updateParameter}
                    strategyDefinition={strategyDefinition}
                    editable
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={saveStrategy}
                    color="primary"
                    variant="contained"
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EditStrategyModal.propTypes = {
    strategy: PropTypes.object.isRequired,
    updateStrategy: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    saveStrategy: PropTypes.func.isRequired,
    strategyDefinition: PropTypes.object.isRequired,
    context: PropTypes.array, // TODO: fix me
};

export default EditStrategyModal;
