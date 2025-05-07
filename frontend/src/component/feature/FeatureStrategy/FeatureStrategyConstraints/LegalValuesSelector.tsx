import { useEffect, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, Button, Checkbox, styled } from '@mui/material';
import type { ILegalValue } from 'interfaces/context';
import {
    filterLegalValues,
    LegalValueLabel,
} from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/LegalValueLabel/LegalValueLabel';
import { ConstraintValueSearch } from './ConstraintValueSearch';

interface IRestrictiveLegalValuesProps {
    data: {
        legalValues: ILegalValue[];
        deletedLegalValues: ILegalValue[];
    };
    constraintValues: string[];
    values: string[];
    addValues: (values: string[]) => void;
    removeValue: (values: string) => void;
    clearAll: () => void;
    beforeValues?: JSX.Element;
}

interface IValuesMap {
    [key: string]: boolean;
}

const createValuesMap = (values: string[]): IValuesMap => {
    return values.reduce((result: IValuesMap, currentValue: string) => {
        if (!result[currentValue]) {
            result[currentValue] = true;
        }
        return result;
    }, {});
};

export const getLegalValueSet = (values: ILegalValue[]) => {
    return new Set(values.map(({ value }) => value));
};

export const getIllegalValues = (
    constraintValues: string[],
    deletedLegalValues: ILegalValue[],
) => {
    const deletedValuesSet = getLegalValueSet(deletedLegalValues);

    return constraintValues.filter(
        (value) => value && deletedValuesSet.has(value),
    );
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
    data,
    values,
    // setValues,
    addValues,
    removeValue,
    clearAll,
    // setValuesWithRecord,
    constraintValues,
}: IRestrictiveLegalValuesProps) => {
    const [filter, setFilter] = useState('');
    const { legalValues, deletedLegalValues } = data;

    const filteredValues = filterLegalValues(legalValues, filter);

    // Lazily initialise the values because there might be a lot of them.
    const [valuesMap, setValuesMap] = useState(() => createValuesMap(values));

    const cleanDeletedLegalValues = (constraintValues: string[]): string[] => {
        const deletedValuesSet = getLegalValueSet(deletedLegalValues);
        return (
            constraintValues?.filter((value) => !deletedValuesSet.has(value)) ||
            []
        );
    };

    const illegalValues = getIllegalValues(
        constraintValues,
        deletedLegalValues,
    );

    useEffect(() => {
        setValuesMap(createValuesMap(values));
    }, [values, setValuesMap, createValuesMap]);

    useEffect(() => {
        if (illegalValues.length > 0) {
            console.log('would clean deleted values here');
            // setValues(cleanDeletedLegalValues(values));
        }
    }, []);

    const onChange = (legalValue: string) => {
        if (valuesMap[legalValue]) {
            removeValue(legalValue);
            // const index = values.findIndex((value) => value === legalValue);
            // const newValues = [...values];
            // newValues.splice(index, 1);
            // setValuesWithRecord(newValues);
            return;
        }

        addValues([legalValue]);
        // setValuesWithRecord([...cleanDeletedLegalValues(values), legalValue]);
    };

    const isAllSelected = legalValues.every((value) =>
        values.includes(value.value),
    );

    const onSelectAll = () => {
        if (isAllSelected) {
            clearAll();
            return;
            // return setValuesWithRecord([]);
        } else {
            addValues(legalValues.map(({ value }) => value));
        }
        // setValuesWithRecord([
        //     ...legalValues.map((legalValue) => legalValue.value),
        // ]);
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
            <ConditionallyRender
                condition={Boolean(illegalValues && illegalValues.length > 0)}
                show={
                    <Alert severity='warning'>
                        This constraint is using legal values that have been
                        deleted as valid options. If you save changes on this
                        constraint and then save the strategy the following
                        values will be removed:
                        <ul>
                            {illegalValues?.map((value) => (
                                <li key={value}>{value}</li>
                            ))}
                        </ul>
                    </Alert>
                }
            />
            <p>Select values from a predefined set</p>
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
                                checked={Boolean(valuesMap[match.value])}
                                onChange={() => onChange(match.value)}
                                name='legal-value'
                                color='primary'
                                disabled={deletedLegalValues
                                    .map(({ value }) => value)
                                    .includes(match.value)}
                            />
                        }
                    />
                ))}
            </StyledValuesContainer>
        </LegalValuesSelectorWidget>
    );
};
