import { IConstraint } from 'interfaces/strategy';

import { useStyles } from 'component/common/ConstraintAccordion/ConstraintAccordion.styles';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { ConstraintIcon } from 'component/common/ConstraintAccordion/ConstraintIcon';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    dateOperators,
    DATE_AFTER,
    IN,
    stringOperators,
} from 'constants/operators';
import { resolveText } from './helpers';
import { oneOf } from 'utils/oneOf';
import React, { useEffect, useState } from 'react';
import { Operator } from 'constants/operators';
import { ConstraintOperatorSelect } from 'component/common/ConstraintAccordion/ConstraintOperatorSelect/ConstraintOperatorSelect';
import {
    operatorsForContext,
    CURRENT_TIME_CONTEXT_FIELD,
} from 'utils/operatorsForContext';
import { InvertedOperatorButton } from '../StyledToggleButton/InvertedOperatorButton/InvertedOperatorButton';
import { CaseSensitiveButton } from '../StyledToggleButton/CaseSensitiveButton/CaseSensitiveButton';
import { ConstraintAccordionHeaderActions } from '../../ConstraintAccordionHeaderActions/ConstraintAccordionHeaderActions';

interface IConstraintAccordionViewHeader {
    localConstraint: IConstraint;
    setContextName: (contextName: string) => void;
    setOperator: (operator: Operator) => void;
    setLocalConstraint: React.Dispatch<React.SetStateAction<IConstraint>>;
    action: string;
    compact: boolean;
    onDelete?: () => void;
    setInvertedOperator: () => void;
    setCaseInsensitive: () => void;
}

export const ConstraintAccordionEditHeader = ({
    compact,
    localConstraint,
    setLocalConstraint,
    setContextName,
    setOperator,
    onDelete,
    setInvertedOperator,
    setCaseInsensitive,
}: IConstraintAccordionViewHeader) => {
    const { classes: styles } = useStyles();
    const { context } = useUnleashContext();
    const { contextName, operator } = localConstraint;
    const [showCaseSensitiveButton, setShowCaseSensitiveButton] =
        useState(false);

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

        if (oneOf(stringOperators, operator)) {
            setShowCaseSensitiveButton(true);
        } else {
            setShowCaseSensitiveButton(false);
        }
    }, [contextName, setOperator, operator, setLocalConstraint]);

    if (!context) {
        return null;
    }

    const constraintNameOptions = context.map(context => {
        return { key: context.name, label: context.name };
    });

    const onOperatorChange = (operator: Operator) => {
        if (oneOf(stringOperators, operator)) {
            setShowCaseSensitiveButton(true);
        } else {
            setShowCaseSensitiveButton(false);
        }

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
                    <InvertedOperatorButton
                        localConstraint={localConstraint}
                        setInvertedOperator={setInvertedOperator}
                    />
                    <div className={styles.headerSelect}>
                        <ConstraintOperatorSelect
                            options={operatorsForContext(contextName)}
                            value={operator}
                            onChange={onOperatorChange}
                        />
                    </div>
                    <ConditionallyRender
                        condition={showCaseSensitiveButton}
                        show={
                            <CaseSensitiveButton
                                localConstraint={localConstraint}
                                setCaseInsensitive={setCaseInsensitive}
                            />
                        }
                    />
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
            <ConstraintAccordionHeaderActions onDelete={onDelete} disableEdit />
        </div>
    );
};
