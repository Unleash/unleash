import { type FC, useId, useState } from 'react';
import {
    Alert,
    Button,
    Checkbox,
    type CheckboxProps,
    Radio,
    styled,
} from '@mui/material';
import {
    filterLegalValues,
    LegalValueLabel,
} from 'component/common/NewConstraintAccordion/LegalValueLabel/LegalValueLabel.tsx';
import { ConstraintValueSearch } from './ConstraintValueSearch.tsx';
import type { ILegalValue } from 'interfaces/context';
import React from 'react';

const StyledValuesContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    maxHeight: '378px',
    overflow: 'auto',
}));

const Row = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const LegalValuesSelectorWidget = styled('article')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

type BaseProps = {
    legalValues: ILegalValue[];
    onChange: (value: string) => void;
    deletedLegalValues?: Set<string>;
    invalidLegalValues?: Set<string>;
    isInputSelected: (value: string) => boolean;
    multiSelect?: {
        selectAll: () => void;
        clearAll: () => void;
        values: Set<string>;
    };
};

const BaseLegalValueSelector: FC<BaseProps> = ({
    legalValues,
    onChange,
    deletedLegalValues,
    invalidLegalValues,
    isInputSelected: isInputChecked,
    multiSelect,
}) => {
    const [filter, setFilter] = useState('');
    const labelId = useId();
    const descriptionId = useId();
    const groupNameId = useId();
    const alertId = useId();

    const filteredValues = filterLegalValues(legalValues, filter);

    const isAllSelected =
        multiSelect &&
        legalValues.length ===
            multiSelect.values.size + (deletedLegalValues?.size ?? 0);

    const handleSearchKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (filteredValues.length > 0) {
                const firstValue = filteredValues[0].value;
                onChange(firstValue);
            }
        }
    };
    const Control = multiSelect ? Checkbox : Radio;

    return (
        <LegalValuesSelectorWidget>
            {deletedLegalValues?.size ? (
                <Alert id={alertId} severity='warning'>
                    This constraint is currently using values that were valid in
                    the past but have since been deleted. If you save changes on
                    this constraint and then save the strategy the following
                    values will be removed:
                    <ul>
                        {[...deletedLegalValues].map((value) => (
                            <li key={value}>{value}</li>
                        ))}
                    </ul>
                </Alert>
            ) : null}
            <p>
                <span id={labelId}>Select values from a predefined set</span>
                {invalidLegalValues?.size ? (
                    <span id={descriptionId}>
                        Values that are not valid for your chosen operator have
                        been disabled.
                    </span>
                ) : null}
            </p>
            <Row>
                <ConstraintValueSearch
                    onKeyDown={handleSearchKeyDown}
                    filter={filter}
                    setFilter={setFilter}
                />
                {multiSelect ? (
                    <Button
                        sx={{
                            whiteSpace: 'nowrap',
                        }}
                        variant={'text'}
                        onClick={() => {
                            if (isAllSelected) {
                                multiSelect.clearAll();
                                return;
                            } else {
                                multiSelect.selectAll();
                            }
                        }}
                    >
                        {isAllSelected ? 'Unselect all' : 'Select all'}
                    </Button>
                ) : null}
            </Row>
            <StyledValuesContainer
                aria-labelledby={labelId}
                aria-describedby={descriptionId}
                aria-details={alertId}
                role={multiSelect ? undefined : 'radiogroup'}
            >
                {filteredValues.map((match) => (
                    <MemoLabel
                        key={match.value}
                        legal={match}
                        filter={filter}
                        Control={Control}
                        onChange={onChange}
                        groupNameId={groupNameId}
                        checked={isInputChecked(match.value)}
                        disabled={invalidLegalValues?.has(match.value)}
                    />
                ))}
            </StyledValuesContainer>
        </LegalValuesSelectorWidget>
    );
};

const MemoLabel = React.memo(function MemoLabel({
    legal,
    filter,
    Control,
    onChange,
    groupNameId,
    checked,
    disabled,
}: {
    legal: ILegalValue;
    filter: string;
    Control: (props: CheckboxProps) => JSX.Element;
    onChange: (value: string) => void;
    checked: boolean;
    groupNameId: string;
    disabled?: boolean;
}) {
    return (
        <LegalValueLabel
            legal={legal}
            filter={filter}
            control={
                <Control
                    color='primary'
                    name={`legal-value-${groupNameId}`}
                    checked={checked}
                    onChange={() => onChange(legal.value)}
                    disabled={disabled}
                />
            }
        />
    );
});

type LegalValuesSelectorProps = {
    values: Set<string>;
    addValues: (value: string | string[]) => void;
    toggleValue: (value: string) => void;
    clearAll: () => void;
    deletedLegalValues?: Set<string>;
    invalidLegalValues?: Set<string>;
    legalValues: ILegalValue[];
};

export const LegalValuesSelector = ({
    legalValues,
    values,
    addValues,
    toggleValue,
    clearAll,
    ...baseProps
}: LegalValuesSelectorProps) => {
    return (
        <BaseLegalValueSelector
            legalValues={legalValues}
            isInputSelected={(inputValue) => values.has(inputValue)}
            onChange={toggleValue}
            multiSelect={{
                clearAll,
                selectAll: () => {
                    addValues(legalValues.map(({ value }) => value));
                },
                values,
            }}
            {...baseProps}
        />
    );
};

type SingleLegalValueSelectorProps = {
    value: string;
    deletedLegalValues?: Set<string>;
    legalValues: ILegalValue[];
    toggleValue: (value: string) => void;
    invalidLegalValues?: Set<string>;
};

export const SingleLegalValueSelector = ({
    value,
    toggleValue,
    ...baseProps
}: SingleLegalValueSelectorProps) => {
    return (
        <BaseLegalValueSelector
            onChange={toggleValue}
            isInputSelected={(inputValue) => inputValue === value}
            {...baseProps}
        />
    );
};
