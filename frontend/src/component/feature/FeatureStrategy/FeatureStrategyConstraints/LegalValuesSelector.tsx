import { type FC, useId, useState } from 'react';
import { Alert, Button, Checkbox, Radio, styled } from '@mui/material';
import {
    filterLegalValues,
    LegalValueLabel,
} from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/LegalValueLabel/LegalValueLabel';
import { ConstraintValueSearch } from './ConstraintValueSearch';
import type { ILegalValue } from 'interfaces/context';

const StyledValuesContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
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
                <Alert severity='warning'>
                    This constraint is using legal values that have been deleted
                    as valid options. If you save changes on this constraint and
                    then save the strategy the following values will be removed:
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
                role={multiSelect ? undefined : 'radiogroup'}
            >
                {filteredValues.map((match) => (
                    <LegalValueLabel
                        key={match.value}
                        legal={match}
                        filter={filter}
                        control={
                            <Control
                                color='primary'
                                name={`legal-value-${groupNameId}`}
                                checked={isInputChecked(match.value)}
                                onChange={() => onChange(match.value)}
                                disabled={invalidLegalValues?.has(match.value)}
                            />
                        }
                    />
                ))}
            </StyledValuesContainer>
        </LegalValuesSelectorWidget>
    );
};

type LegalValuesSelectorProps = {
    values: Set<string>;
    addValues: (values: string[]) => void;
    removeValue: (value: string) => void;
    clearAll: () => void;
    deletedLegalValues?: Set<string>;
    invalidLegalValues?: Set<string>;
    legalValues: ILegalValue[];
};

export const LegalValuesSelector = ({
    legalValues,
    values,
    addValues,
    removeValue,
    clearAll,
    ...baseProps
}: LegalValuesSelectorProps) => {
    const onChange = (legalValue: string) => {
        if (values.has(legalValue)) {
            removeValue(legalValue);
        } else {
            addValues([legalValue]);
        }
    };

    return (
        <BaseLegalValueSelector
            legalValues={legalValues}
            isInputSelected={(inputValue) => values.has(inputValue)}
            onChange={onChange}
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
    addValue: (value: string) => void;
    clear: () => void;
    deletedLegalValues?: Set<string>;
    legalValues: ILegalValue[];
    invalidLegalValues?: Set<string>;
};

export const SingleLegalValueSelector = ({
    value,
    addValue,
    clear,
    ...baseProps
}: SingleLegalValueSelectorProps) => {
    const onChange = (newValue: string) => {
        if (value === newValue) {
            clear();
        } else {
            addValue(newValue);
        }
    };

    return (
        <BaseLegalValueSelector
            onChange={onChange}
            isInputSelected={(inputValue) => inputValue === value}
            {...baseProps}
        />
    );
};
