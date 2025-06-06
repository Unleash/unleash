import type { IConstraint } from 'interfaces/strategy';

import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { ConstraintIcon } from 'component/common/LegacyConstraintAccordion/ConstraintIcon';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    dateOperators,
    DATE_AFTER,
    IN,
    stringOperators,
} from 'constants/operators';
import { resolveText } from './helpers.ts';
import { oneOf } from 'utils/oneOf';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { Operator } from 'constants/operators';
import { ConstraintOperatorSelect } from 'component/common/LegacyConstraintAccordion/ConstraintOperatorSelect';
import {
    operatorsForContext,
    CURRENT_TIME_CONTEXT_FIELD,
} from 'utils/operatorsForContext';
import { InvertedOperatorButton } from '../StyledToggleButton/InvertedOperatorButton/InvertedOperatorButton.tsx';
import { CaseSensitiveButton } from '../StyledToggleButton/CaseSensitiveButton/CaseSensitiveButton.tsx';
import { ConstraintAccordionEditActions } from '../../ConstraintAccordionEditActions/ConstraintAccordionEditActions.tsx';
import { styled } from '@mui/material';

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
    onUndo: () => void;
    constraintChanges: IConstraint[];
}

const StyledHeaderContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
    },
}));
const StyledSelectContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down(770)]: {
        flexDirection: 'column',
    },
}));
const StyledBottomSelect = styled('div')(({ theme }) => ({
    [theme.breakpoints.down(770)]: {
        marginTop: theme.spacing(2),
    },
    display: 'inline-flex',
}));

const StyledHeaderSelect = styled('div')(({ theme }) => ({
    marginRight: theme.spacing(2),
    width: '200px',
    [theme.breakpoints.between(1101, 1365)]: {
        width: '170px',
        marginRight: theme.spacing(1),
    },
}));

const StyledGeneralSelect = styled(GeneralSelect)(({ theme }) => ({
    marginRight: theme.spacing(2),
    width: '200px',
    [theme.breakpoints.between(1101, 1365)]: {
        width: '170px',
        marginRight: theme.spacing(1),
    },
}));

const StyledHeaderText = styled('p')(({ theme }) => ({
    maxWidth: '400px',
    fontSize: theme.fontSizes.smallBody,
    [theme.breakpoints.down('xl')]: {
        display: 'none',
    },
}));

export const ConstraintAccordionEditHeader = ({
    compact,
    constraintChanges,
    localConstraint,
    setLocalConstraint,
    setContextName,
    setOperator,
    onDelete,
    onUndo,
    setInvertedOperator,
    setCaseInsensitive,
}: IConstraintAccordionViewHeader) => {
    const { context } = useUnleashContext();
    const { contextName, operator } = localConstraint;
    const [showCaseSensitiveButton, setShowCaseSensitiveButton] =
        useState(false);

    /* We need a special case to handle the currentTime context field. Since
    this field will be the only one to allow DATE_BEFORE and DATE_AFTER operators
    this will check if the context field is the current time context field AND check
    if it is not already using one of the date operators (to not overwrite if there is existing
    data). */
    useEffect(() => {
        if (
            contextName === CURRENT_TIME_CONTEXT_FIELD &&
            !oneOf(dateOperators, operator)
        ) {
            setLocalConstraint((prev) => ({
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

    const constraintNameOptions = context.map((context) => {
        return { key: context.name, label: context.name };
    });

    const onOperatorChange = (operator: Operator) => {
        if (oneOf(stringOperators, operator)) {
            setShowCaseSensitiveButton(true);
        } else {
            setShowCaseSensitiveButton(false);
        }

        if (oneOf(dateOperators, operator)) {
            setLocalConstraint((prev) => ({
                ...prev,
                operator: operator,
                value: new Date().toISOString(),
            }));
        } else {
            setOperator(operator);
        }
    };

    return (
        <StyledHeaderContainer>
            <ConstraintIcon />
            <StyledSelectContainer>
                <div>
                    <StyledGeneralSelect
                        id='context-field-select'
                        name='contextName'
                        label='Context Field'
                        autoFocus
                        options={constraintNameOptions}
                        value={contextName || ''}
                        onChange={setContextName}
                    />
                </div>
                <StyledBottomSelect>
                    <InvertedOperatorButton
                        localConstraint={localConstraint}
                        setInvertedOperator={setInvertedOperator}
                    />
                    <StyledHeaderSelect>
                        <ConstraintOperatorSelect
                            options={operatorsForContext(contextName)}
                            value={operator}
                            onChange={onOperatorChange}
                        />
                    </StyledHeaderSelect>
                    <ConditionallyRender
                        condition={showCaseSensitiveButton}
                        show={
                            <CaseSensitiveButton
                                localConstraint={localConstraint}
                                setCaseInsensitive={setCaseInsensitive}
                            />
                        }
                    />
                </StyledBottomSelect>
            </StyledSelectContainer>
            <ConditionallyRender
                condition={!compact}
                show={
                    <StyledHeaderText>
                        {resolveText(operator, contextName)}
                    </StyledHeaderText>
                }
            />
            <ConstraintAccordionEditActions
                onDelete={onDelete}
                onUndo={onUndo}
                constraintChanges={constraintChanges}
                disableEdit
            />
        </StyledHeaderContainer>
    );
};
