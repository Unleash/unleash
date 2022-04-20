import { IConstraint } from 'interfaces/strategy';

import { useStyles } from 'component/common/ConstraintAccordion/ConstraintAccordion.styles';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { ConstraintIcon } from 'component/common/ConstraintAccordion/ConstraintIcon';
import { Help } from '@material-ui/icons';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { dateOperators, DATE_AFTER, IN } from 'constants/operators';
import { SAVE } from '../ConstraintAccordionEdit';
import { resolveText } from './helpers';
import { oneOf } from 'utils/oneOf';
import React, { useEffect } from 'react';
import { Operator } from 'constants/operators';
import { ConstraintOperatorSelect } from 'component/common/ConstraintAccordion/ConstraintOperatorSelect/ConstraintOperatorSelect';
import {
    operatorsForContext,
    CURRENT_TIME_CONTEXT_FIELD,
} from 'utils/operatorsForContext';

interface IConstraintAccordionViewHeader {
    localConstraint: IConstraint;
    setContextName: (contextName: string) => void;
    setOperator: (operator: Operator) => void;
    setLocalConstraint: React.Dispatch<React.SetStateAction<IConstraint>>;
    action: string;
    compact: boolean;
}

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
    const { contextName, operator } = localConstraint;

    /* We need a special case to handle the currenTime context field. Since
    this field will be the only one to allow DATE_BEFORE and DATE_AFTER operators
    this will check if the context field is the current time context field AND check
    if it is not already using one of the date operators (to not overwrite if there is existing
    data). */
    useEffect(() => {
        if (
            contextName === CURRENT_TIME_CONTEXT_FIELD &&
            !oneOf(dateOperators, operator)
        ) {
            setLocalConstraint(prev => ({
                ...prev,
                operator: DATE_AFTER,
                value: new Date().toISOString(),
            }));
        } else if (
            contextName !== CURRENT_TIME_CONTEXT_FIELD &&
            oneOf(dateOperators, operator)
        ) {
            setOperator(IN);
        }
    }, [contextName, setOperator, operator, setLocalConstraint]);

    if (!context) {
        return null;
    }

    const constraintNameOptions = context.map(context => {
        return { key: context.name, label: context.name };
    });

    const onOperatorChange = (operator: Operator) => {
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
                        value={contextName || ''}
                        onChange={setContextName}
                        className={styles.headerSelect}
                    />
                </div>
                <div className={styles.bottomSelect}>
                    <div className={styles.headerSelect}>
                        <ConstraintOperatorSelect
                            options={operatorsForContext(contextName)}
                            value={operator}
                            onChange={onOperatorChange}
                        />
                    </div>
                </div>
            </div>
            <ConditionallyRender
                condition={!compact}
                show={
                    <p className={styles.headerText}>
                        {resolveText(operator, contextName)}
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
