import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip, Typography } from '@material-ui/core';
import { Info } from '@material-ui/icons';

import StrategyConstraintInputField from '../StrategyConstraintInputField';
import { useCommonStyles } from '../../../../../common.styles';

const StrategyConstraintInput = ({
    constraints,
    updateConstraints,
    contextNames,
    contextFields,
    enabled,
    constraintError,
    setConstraintError,
}) => {
    const commonStyles = useCommonStyles();
    const addConstraint = evt => {
        evt.preventDefault();
        const updatedConstraints = [...constraints];
        updatedConstraints.push({
            contextName: contextNames[0],
            operator: 'IN',
            values: [],
        });

        updateConstraints(updatedConstraints);
    };

    const removeConstraint = index => evt => {
        evt.preventDefault();
        const updatedConstraints = [...constraints];
        updatedConstraints.splice(index, 1);

        updateConstraints(updatedConstraints);
    };

    const updateConstraint = index => (value, field) => {
        const updatedConstraints = [...constraints];
        const constraint = updatedConstraints[index];
        constraint[field] = value;
        updateConstraints(updatedConstraints);
    };

    if (!enabled) {
        return null;
    }

    return (
        <div className={commonStyles.contentSpacingY}>
            <Tooltip
                placement="right-start"
                title={
                    <span>
                        Use context fields to constrain the activation strategy.
                    </span>
                }
            >
                <Typography variant="subtitle2">
                    {'Constraints '}

                    <Info style={{ fontSize: '0.9rem', color: 'gray' }} />
                </Typography>
            </Tooltip>
            <table style={{ margin: 0 }}>
                <tbody>
                    {constraints.map((c, index) => (
                        <StrategyConstraintInputField
                            key={`${c.contextName}-${index}`}
                            id={`${c.contextName}-${index}`}
                            constraint={c}
                            contextFields={contextFields}
                            updateConstraint={updateConstraint(index)}
                            removeConstraint={removeConstraint(index)}
                            constraintError={constraintError}
                            setConstraintError={setConstraintError}
                        />
                    ))}
                </tbody>
            </table>
            <small>
                <Button
                    title="Add constraint"
                    variant="contained"
                    color="primary"
                    onClick={addConstraint}
                >
                    Add constraint
                </Button>
            </small>
        </div>
    );
};
StrategyConstraintInput.propTypes = {
    constraints: PropTypes.array.isRequired,
    updateConstraints: PropTypes.func.isRequired,
    contextNames: PropTypes.array.isRequired,
    contextFields: PropTypes.array.isRequired,
    enabled: PropTypes.bool.isRequired,
};

export default StrategyConstraintInput;
