import { IConstraint } from 'interfaces/strategy';

import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { ConstraintIcon } from 'component/common/ConstraintAccordion/ConstraintIcon';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    dateOperators,
    DATE_AFTER,
    IN,
    stringOperators,
    inOperators,
} from 'constants/operators';
import { resolveText } from './helpers';
import { oneOf } from 'utils/oneOf';
import React, { useEffect, useState } from 'react';
import { Operator } from 'constants/operators';
import { ConstraintOperatorSelect } from 'component/common/ConstraintAccordion/ConstraintOperatorSelect';
import {
    operatorsForContext,
    CURRENT_TIME_CONTEXT_FIELD,
} from 'utils/operatorsForContext';
import { InvertedOperatorButton } from '../StyledToggleButton/InvertedOperatorButton/InvertedOperatorButton';
import { CaseSensitiveButton } from '../StyledToggleButton/CaseSensitiveButton/CaseSensitiveButton';
import { ConstraintAccordionHeaderActions } from '../../ConstraintAccordionHeaderActions/ConstraintAccordionHeaderActions';
import { styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

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
    localConstraint,
    setLocalConstraint,
    setContextName,
    setOperator,
    onDelete,
    setInvertedOperator,
    setCaseInsensitive,
}: IConstraintAccordionViewHeader) => {
    const { context } = useUnleashContext();
    const { contextName, operator } = localConstraint;
    const [showCaseSensitiveButton, setShowCaseSensitiveButton] =
        useState(false);
    const { uiConfig } = useUiConfig();

    const caseInsensitiveInOperators = Boolean(
        uiConfig.flags.caseInsensitiveInOperators
    );

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

        if (
            oneOf(stringOperators, operator) ||
            (oneOf(inOperators, operator) && caseInsensitiveInOperators)
        ) {
            setShowCaseSensitiveButton(true);
        } else {
            setShowCaseSensitiveButton(false);
        }
    }, [
        contextName,
        setOperator,
        operator,
        setLocalConstraint,
        caseInsensitiveInOperators,
    ]);

    if (!context) {
        return null;
    }

    const constraintNameOptions = context.map(context => {
        return { key: context.name, label: context.name };
    });

    const onOperatorChange = (operator: Operator) => {
        if (
            oneOf(stringOperators, operator) ||
            (oneOf(inOperators, operator) && caseInsensitiveInOperators)
        ) {
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
        <StyledHeaderContainer>
            <ConstraintIcon />
            <StyledSelectContainer>
                <div>
                    <StyledGeneralSelect
                        id="context-field-select"
                        name="contextName"
                        label="Context Field"
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
            <ConstraintAccordionHeaderActions onDelete={onDelete} disableEdit />
        </StyledHeaderContainer>
    );
};
