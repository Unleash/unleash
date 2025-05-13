import { useEffect, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, Button, Checkbox, Chip, Stack, styled } from '@mui/material';
import { ConstraintValueSearch } from 'component/common/LegacyConstraintAccordion/ConstraintValueSearch/ConstraintValueSearch';
import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';
import type { ILegalValue } from 'interfaces/context';
import {
    filterLegalValues,
    LegalValueLabel,
} from '../LegalValueLabel/LegalValueLabel';
import { useUiFlag } from 'hooks/useUiFlag';

interface IRestrictiveLegalValuesProps {
    data: {
        legalValues: ILegalValue[];
        deletedLegalValues: ILegalValue[];
    };
    constraintValues: string[];
    values: string[];
    setValues: (values: string[]) => void;
    setValuesWithRecord: (values: string[]) => void;
    beforeValues?: JSX.Element;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
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
        (value) => value !== '' && deletedValuesSet.has(value),
    );
};

const StyledValuesContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    maxHeight: '378px',
    overflow: 'auto',
}));

const StyledChipList = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
}));

const StyledStack = styled(Stack)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(0.5),
    justifyContent: 'space-between',
}));

const ErrorText = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.error.main,
}));

/**
 * @deprecated use `/component/feature/FeatureStrategy/FeatureStrategyConstraints/LegalValuesSelector.tsx`
 * Remove with flag `addEditStrategy`
 */
export const RestrictiveLegalValues = ({
    data,
    values,
    setValues,
    setValuesWithRecord,
    error,
    setError,
    constraintValues,
}: IRestrictiveLegalValuesProps) => {
    const [filter, setFilter] = useState('');
    const { legalValues, deletedLegalValues } = data;

    const filteredValues = filterLegalValues(legalValues, filter);

    // Lazily initialise the values because there might be a lot of them.
    const [valuesMap, setValuesMap] = useState(() => createValuesMap(values));

    const disableShowContextFieldSelectionValues = useUiFlag(
        'disableShowContextFieldSelectionValues',
    );

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
            setValues(cleanDeletedLegalValues(values));
        }
    }, []);

    const onChange = (legalValue: string) => {
        setError('');

        if (valuesMap[legalValue]) {
            const index = values.findIndex((value) => value === legalValue);
            const newValues = [...values];
            newValues.splice(index, 1);
            setValuesWithRecord(newValues);
            return;
        }

        setValuesWithRecord([...cleanDeletedLegalValues(values), legalValue]);
    };

    const isAllSelected = legalValues.every((value) =>
        values.includes(value.value),
    );

    const onSelectAll = () => {
        if (isAllSelected) {
            return setValuesWithRecord([]);
        }
        setValuesWithRecord([
            ...legalValues.map((legalValue) => legalValue.value),
        ]);
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
        <>
            <ConditionallyRender
                condition={Boolean(illegalValues && illegalValues.length > 0)}
                show={
                    <Alert severity='warning'>
                        This constraint is currently using values that were
                        valid in the past but have since been deleted. If you
                        save changes on this constraint and then save the
                        strategy the following values will be removed:
                        <ul>
                            {illegalValues?.map((value) => (
                                <li key={value}>{value}</li>
                            ))}
                        </ul>
                    </Alert>
                }
            />
            <StyledStack direction={'row'}>
                <ConstraintFormHeader>
                    Select values from a predefined set
                </ConstraintFormHeader>
                <Button variant={'text'} onClick={onSelectAll}>
                    {isAllSelected ? 'Unselect all' : 'Select all'}
                </Button>
            </StyledStack>
            <ConditionallyRender
                condition={legalValues.length > 100}
                show={
                    <>
                        <ConditionallyRender
                            condition={
                                !disableShowContextFieldSelectionValues &&
                                Boolean(values)
                            }
                            show={
                                <StyledChipList
                                    sx={{ border: 0, paddingTop: 0 }}
                                >
                                    {values.map((value) => {
                                        return (
                                            <li key={value}>
                                                <Chip
                                                    label={value}
                                                    onDelete={() =>
                                                        onChange(value)
                                                    }
                                                />
                                            </li>
                                        );
                                    })}
                                </StyledChipList>
                            }
                        />
                    </>
                }
            />
            <div onKeyDown={handleSearchKeyDown}>
                <ConstraintValueSearch filter={filter} setFilter={setFilter} />
            </div>
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
                                name={match.value}
                                color='primary'
                                disabled={deletedLegalValues
                                    .map(({ value }) => value)
                                    .includes(match.value)}
                            />
                        }
                    />
                ))}
            </StyledValuesContainer>
            <ConditionallyRender
                condition={Boolean(error)}
                show={<ErrorText>{error}</ErrorText>}
            />
        </>
    );
};
