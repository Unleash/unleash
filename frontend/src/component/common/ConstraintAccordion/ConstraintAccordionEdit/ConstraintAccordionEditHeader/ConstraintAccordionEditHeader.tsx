import { IConstraint } from '../../../../../interfaces/strategy';

import { useStyles } from '../../ConstraintAccordion.styles';
import useUnleashContext from '../../../../../hooks/api/getters/useUnleashContext/useUnleashContext';
import GeneralSelect from '../../../GeneralSelect/GeneralSelect';
import { ConstraintIcon } from '../../ConstraintIcon';
import { Help } from '@material-ui/icons';
import ConditionallyRender from '../../../ConditionallyRender';
import {
    allOperators,
    dateOperators,
    DATE_AFTER,
    IN,
} from '../../../../../constants/operators';
import { SAVE } from '../ConstraintAccordionEdit';
import { resolveText } from './helpers';
import { oneOf } from 'utils/one-of';
import { useEffect } from 'react';
import { Operator } from 'constants/operators';

interface IConstraintAccordionViewHeader {
    localConstraint: IConstraint;
    setContextName: (contextName: string) => void;
    setOperator: (operator: Operator) => void;
    setLocalConstraint: React.Dispatch<React.SetStateAction<IConstraint>>;
    action: string;
    compact: boolean;
}

const constraintOperators = allOperators.map(operator => {
    return { key: operator, label: operator };
});

export const CURRENT_TIME_CONTEXT_FIELD = 'currentTime';

export const ConstraintAccordionEditHeader = ({
    compact,
    localConstraint,
    setLocalConstraint,
    setContextName,
    setOperator,
    action,
}: IConstraintAccordionViewHeader) => {
    const styles = useStyles();
    const { context } = useUnleashContext();

    /* We need a special case to handle the currenTime context field. Since
    this field will be the only one to allow DATE_BEFORE and DATE_AFTER operators
    this will check if the context field is the current time context field AND check
    if it is not already using one of the date operators (to not overwrite if there is existing
    data). */
    useEffect(() => {
        if (
            localConstraint.contextName === CURRENT_TIME_CONTEXT_FIELD &&
            !oneOf(dateOperators, localConstraint.operator)
        ) {
            setLocalConstraint(prev => ({
                ...prev,
                operator: DATE_AFTER,
                value: new Date().toISOString(),
            }));
        } else if (
            localConstraint.contextName !== CURRENT_TIME_CONTEXT_FIELD &&
            oneOf(dateOperators, localConstraint.operator)
        ) {
            setOperator(IN);
        }
    }, [
        localConstraint.contextName,
        setOperator,
        localConstraint.operator,
        setLocalConstraint,
    ]);

    if (!context) return null;
    const constraintNameOptions = context.map(context => {
        return { key: context.name, label: context.name };
    });

    const filteredOperators = constraintOperators.filter(operator => {
        if (
            oneOf(dateOperators, operator.label) &&
            localConstraint.contextName !== CURRENT_TIME_CONTEXT_FIELD
        ) {
            return false;
        }

        if (
            !oneOf(dateOperators, operator.label) &&
            localConstraint.contextName === CURRENT_TIME_CONTEXT_FIELD
        ) {
            return false;
        }

        return true;
    });

    const onChange = (
        event: React.ChangeEvent<{
            name?: string;
            value: unknown;
        }>
    ) => {
        const operator = event.target.value as Operator;
        if (oneOf(dateOperators, operator)) {
            setLocalConstraint(prev => ({
                ...prev,
                operator: operator,
                value: new Date().toISOString(),
            }));
        } else {
            setOperator(operator);
        }
    };

    return (
        <div className={styles.headerContainer}>
            <ConstraintIcon />
            <div className={styles.selectContainer}>
                <div>
                    <GeneralSelect
                        id="context-field-select"
                        name="contextName"
                        label="Context Field"
                        autoFocus
                        options={constraintNameOptions}
                        value={localConstraint.contextName || ''}
                        onChange={(
                            e: React.ChangeEvent<{
                                name?: string;
                                value: unknown;
                            }>
                        ) => {
                            setContextName(e.target.value as string);
                        }}
                        className={styles.headerSelect}
                    />
                </div>
                <div className={styles.bottomSelect}>
                    <GeneralSelect
                        id="operator-select"
                        name="operator"
                        label="Operator"
                        options={filteredOperators}
                        value={localConstraint.operator}
                        onChange={onChange}
                        className={styles.headerSelect}
                    />
                </div>
            </div>

            <ConditionallyRender
                condition={!compact}
                show={
                    <p className={styles.headerText}>
                        {resolveText(
                            localConstraint.operator,
                            localConstraint.contextName
                        )}
                    </p>
                }
            />

            <ConditionallyRender
                condition={action === SAVE}
                show={<p className={styles.editingBadge}>Updating...</p>}
                elseShow={<p className={styles.editingBadge}>Editing</p>}
            />

            <a
                href="https://docs.getunleash.io/advanced/strategy_constraints"
                style={{ marginLeft: 'auto' }}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Help className={styles.help} />
            </a>
        </div>
    );
};
