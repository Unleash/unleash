import { useId, useState } from 'react';
import {
    Alert,
    Button,
    Checkbox,
    Radio,
    RadioGroup,
    styled,
} from '@mui/material';
import {
    filterLegalValues,
    LegalValueLabel,
} from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/LegalValueLabel/LegalValueLabel';
import { ConstraintValueSearch } from './ConstraintValueSearch';
import type { ILegalValue } from 'interfaces/context';

type LegalValuesSelectorProps = {
    values: Set<string>;
    addValues: (values: string[]) => void;
    removeValue: (value: string) => void;
    clearAll: () => void;
    deletedLegalValues?: Set<string>;
    invalidLegalValues?: Set<string>;
    legalValues: ILegalValue[];
};

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

export const LegalValuesSelector = ({
    legalValues,
    values,
    addValues,
    removeValue,
    clearAll,
    deletedLegalValues,
    invalidLegalValues,
}: LegalValuesSelectorProps) => {
    const [filter, setFilter] = useState('');
    const groupNameId = useId();
    const labelId = useId();

    const filteredValues = filterLegalValues(legalValues, filter);

    const onChange = (legalValue: string) => {
        if (values.has(legalValue)) {
            removeValue(legalValue);
        } else {
            addValues([legalValue]);
        }
    };

    const isAllSelected = legalValues.every((value) => values.has(value.value));

    const onSelectAll = () => {
        if (isAllSelected) {
            clearAll();
            return;
        } else {
            addValues(legalValues.map(({ value }) => value));
        }
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (filteredValues.length > 0) {
                const firstValue = filteredValues[0].value;
                onChange(firstValue);
            }
        }
    };

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
            <p id={labelId}>Select values from a predefined set</p>
            <Row>
                <ConstraintValueSearch
                    onKeyDown={handleSearchKeyDown}
                    filter={filter}
                    setFilter={setFilter}
                />
                <Button
                    sx={{
                        whiteSpace: 'nowrap',
                    }}
                    variant={'text'}
                    onClick={onSelectAll}
                >
                    {isAllSelected ? 'Unselect all' : 'Select all'}
                </Button>
            </Row>
            <StyledValuesContainer>
                {filteredValues.map((match) => (
                    <LegalValueLabel
                        key={match.value}
                        legal={match}
                        filter={filter}
                        control={
                            <Checkbox
                                checked={Boolean(values.has(match.value))}
                                onChange={() => onChange(match.value)}
                                name={`legal-value-${groupNameId}`}
                                color='primary'
                                disabled={invalidLegalValues?.has(match.value)}
                            />
                        }
                    />
                ))}
            </StyledValuesContainer>
        </LegalValuesSelectorWidget>
    );
};

const StyledRadioContainer = styled(RadioGroup)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: theme.spacing(1),
    maxHeight: '378px',
    overflow: 'auto',
}));

type SingleLegalValueSelectorProps = {
    value: string;
    addValue: (value: string) => void;
    clear: () => void;
    deletedLegalValues?: Set<string>;
    legalValues: ILegalValue[];
    invalidLegalValues?: Set<string>;
};

export const SingleLegalValueSelector = ({
    legalValues,
    value,
    addValue,
    clear,
    deletedLegalValues,
    invalidLegalValues,
}: SingleLegalValueSelectorProps) => {
    const [filter, setFilter] = useState('');
    const labelId = useId();
    const groupNameId = useId();

    const filteredValues = filterLegalValues(legalValues, filter);

    const onChange = (legalValue: string) => {
        if (value === legalValue) {
            clear();
        } else {
            addValue(legalValue);
        }
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (filteredValues.length > 0) {
                const firstValue = filteredValues[0].value;
                onChange(firstValue);
            }
        }
    };

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
            <p id={labelId}>Select values from a predefined set</p>
            <Row>
                <ConstraintValueSearch
                    onKeyDown={handleSearchKeyDown}
                    filter={filter}
                    setFilter={setFilter}
                />
            </Row>
            <StyledRadioContainer
                aria-labelledby={labelId}
                name={`legal-value-${groupNameId}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {filteredValues.map((match) => (
                    <LegalValueLabel
                        key={match.value}
                        legal={match}
                        filter={filter}
                        control={
                            <Radio
                                color='primary'
                                disabled={invalidLegalValues?.has(match.value)}
                            />
                        }
                    />
                ))}
            </StyledRadioContainer>
        </LegalValuesSelectorWidget>
    );
};
