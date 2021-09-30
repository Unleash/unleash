import FlexibleStrategy from '../../common/FlexibleStrategy/FlexibleStrategy';
import {
    IConstraint,
    IFeatureStrategy,
} from '../../../../../../interfaces/strategy';
import useUnleashContext from '../../../../../../hooks/api/getters/useUnleashContext/useUnleashContext';
import useStrategies from '../../../../../../hooks/api/getters/useStrategies/useStrategies';
import GeneralStrategy from '../../common/GeneralStrategy/GeneralStrategy';
import UserWithIdStrategy from '../../common/UserWithIdStrategy/UserWithId';
import StrategyConstraints from '../../common/StrategyConstraints/StrategyConstraints';
import { useContext, useState } from 'react';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import useUiConfig from '../../../../../../hooks/api/getters/useUiConfig/useUiConfig';
import { C } from '../../../../../common/flags';
import { Button } from '@material-ui/core';
import { useStyles } from './FeatureStrategyAccordionBody.styles';
import Dialogue from '../../../../../common/Dialogue';
import FeatureStrategiesSeparator from '../../FeatureStrategiesEnvironments/FeatureStrategiesSeparator/FeatureStrategiesSeparator';
import DefaultStrategy from '../../common/DefaultStrategy/DefaultStrategy';
import { ADD_CONSTRAINT_ID } from '../../../../../../testIds';
import AccessContext from '../../../../../../contexts/AccessContext';
import { UPDATE_FEATURE } from '../../../../../AccessProvider/permissions';

interface IFeatureStrategyAccordionBodyProps {
    strategy: IFeatureStrategy;
    setStrategyParams: () => any;
    updateParameters: (field: string, value: any) => any;
    updateConstraints: (constraints: IConstraint[]) => void;
    constraints: IConstraint[];
    setStrategyConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
}

const FeatureStrategyAccordionBody: React.FC<IFeatureStrategyAccordionBodyProps> =
    ({
        strategy,
        updateParameters,
        children,
        constraints,
        updateConstraints,
        setStrategyConstraints,
    }) => {
        const styles = useStyles();
        const [constraintError, setConstraintError] = useState({});
        const { strategies } = useStrategies();
        const { uiConfig } = useUiConfig();
        const [showConstraints, setShowConstraints] = useState(false);
        const { hasAccess } = useContext(AccessContext);

        const { context } = useUnleashContext();

        const resolveInputType = () => {
            switch (strategy?.name) {
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

        const toggleConstraints = () => setShowConstraints(prev => !prev);

        const resolveStrategyDefinition = () => {
            const definition = strategies.find(
                definition => definition.name === strategy.name
            );

            return definition;
        };

        const saveConstraintsLocally = () => {
            let valid = true;

            constraints.forEach((constraint, index) => {
                const { values } = constraint;

                if (values.length === 0) {
                    setConstraintError(prev => ({
                        ...prev,
                        [`${constraint.contextName}-${index}`]:
                            'You need to specify at least one value',
                    }));
                    valid = false;
                }
            });

            if (valid) {
                setShowConstraints(false);
                setStrategyConstraints(constraints);
            }
        };

        const renderConstraints = () => {
            if (constraints.length === 0) {
                return (
                    <p className={styles.noConstraints}>
                        No constraints configured
                    </p>
                );
            }

            return constraints.map((constraint, index) => {
                return (
                    <div
                        key={`${constraint.contextName}-${index}`}
                        className={styles.constraint}
                    >
                        <span className={styles.contextName}>
                            {constraint.contextName}
                        </span>
                        <FeatureStrategiesSeparator
                            text={constraint.operator}
                            maxWidth="none"
                        />
                        <span className={styles.values}>
                            {constraint.values.join(', ')}
                        </span>
                    </div>
                );
            });
        };

        const closeConstraintDialog = () => {
            setShowConstraints(false);
            const filteredConstraints = constraints.filter(constraint => {
                return constraint.values.length > 0;
            });
            updateConstraints(filteredConstraints);
        };

        const Type = resolveInputType();
        const definition = resolveStrategyDefinition();

        const { parameters } = strategy;
        const ON = uiConfig.flags[C];

        return (
            <div className={styles.accordionContainer}>
                <ConditionallyRender
                    condition={ON}
                    show={
                        <>
                            <p className={styles.constraintHeader}>
                                Constraints
                            </p>
                            {renderConstraints()}
                            <ConditionallyRender
                                condition={hasAccess(UPDATE_FEATURE)}
                                show={
                                    <Button
                                        className={styles.addConstraintBtn}
                                        onClick={toggleConstraints}
                                        data-test={ADD_CONSTRAINT_ID}
                                    >
                                        + Add constraint
                                    </Button>
                                }
                            />
                        </>
                    }
                />

                <Dialogue
                    title="Define constraints"
                    open={showConstraints}
                    onClick={saveConstraintsLocally}
                    primaryButtonText="Update constraints"
                    secondaryButtonText="Cancel"
                    onClose={closeConstraintDialog}
                    fullWidth
                    maxWidth="md"
                >
                    <StrategyConstraints
                        updateConstraints={updateConstraints}
                        constraints={constraints || []}
                        constraintError={constraintError}
                        setConstraintError={setConstraintError}
                    />
                </Dialogue>

                <ConditionallyRender
                    condition={hasAccess(UPDATE_FEATURE)}
                    show={
                        <Type
                            parameters={parameters}
                            updateParameter={updateParameters}
                            strategyDefinition={definition}
                            context={context}
                            editable
                        />
                    }
                />

                {children}
            </div>
        );
    };

export default FeatureStrategyAccordionBody;
