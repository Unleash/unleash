import { Button, Tooltip, Typography } from '@material-ui/core';
import { Info } from '@material-ui/icons';

import { IConstraint } from '../../../../../../interfaces/strategy';
import { useCommonStyles } from '../../../../../../common.styles';
import useUiConfig from '../../../../../../hooks/api/getters/useUiConfig/useUiConfig';
import { C } from '../../../../../common/flags';
import useUnleashContext from '../../../../../../hooks/api/getters/useUnleashContext/useUnleashContext';
import StrategyConstraintInputField from './StrategyConstraintInputField';
import { useEffect } from 'react';

interface IStrategyConstraintProps {
    constraints: IConstraint[];
    updateConstraints: (constraints: IConstraint[]) => void;
    constraintError: string;
    setConstraintError: () => void;
}

const StrategyConstraints: React.FC<IStrategyConstraintProps> = ({
    constraints,
    updateConstraints,
    constraintError,
    setConstraintError,
}) => {
    const { uiConfig } = useUiConfig();
    const { context } = useUnleashContext();
    const commonStyles = useCommonStyles();

    useEffect(() => {
        if (constraints.length === 0) {
            addConstraint();
        }
        /* eslint-disable-next-line */
    }, []);

    const contextFields = context;

    const enabled = uiConfig.flags[C];
    const contextNames = contextFields.map(context => context.name);

    const onClick = evt => {
        evt.preventDefault();
        addConstraint();
    };

    const addConstraint = () => {
        const updatedConstraints = [...constraints];
        updatedConstraints.push(createConstraint());
        updateConstraints(updatedConstraints);
    };

    const createConstraint = () => {
        return {
            contextName: contextNames[0],
            operator: 'IN',
            values: [],
        };
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
                    onClick={onClick}
                >
                    Add constraint
                </Button>
            </small>
        </div>
    );
};

export default StrategyConstraints;
