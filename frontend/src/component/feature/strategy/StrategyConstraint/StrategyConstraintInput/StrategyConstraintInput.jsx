import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Icon, Typography } from '@material-ui/core';
import StrategyConstraintInputField from '../StrategyConstraintInputField';
import { useCommonStyles } from '../../../../../common.styles';

const StrategyConstraintInput = ({
    constraints,
    updateConstraints,
    contextNames,
    contextFields,
    enabled,
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

                    <Icon style={{ fontSize: '0.9rem', color: 'gray' }}>
                        info
                    </Icon>
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
                        />
                    ))}
                </tbody>
            </table>
            <small>
                <a
                    href="#add-constraint"
                    title="Add constraint"
                    onClick={addConstraint}
                >
                    Add constraint
                </a>
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
