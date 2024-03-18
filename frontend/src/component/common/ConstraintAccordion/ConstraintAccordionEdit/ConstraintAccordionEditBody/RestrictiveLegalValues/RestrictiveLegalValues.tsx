import { useEffect, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, Checkbox } from '@mui/material';
import { useThemeStyles } from 'themes/themeStyles';
import { ConstraintValueSearch } from 'component/common/ConstraintAccordion/ConstraintValueSearch/ConstraintValueSearch';
import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';
import type { ILegalValue } from 'interfaces/context';
import {
    filterLegalValues,
    LegalValueLabel,
} from '../LegalValueLabel/LegalValueLabel';

interface IRestrictiveLegalValuesProps {
    data: {
        legalValues: ILegalValue[];
        deletedLegalValues: ILegalValue[];
    };
    constraintValues: string[];
    values: string[];
    setValues: (values: string[]) => void;
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

    return constraintValues.filter((value) => deletedValuesSet.has(value));
};

export const RestrictiveLegalValues = ({
    data,
    values,
    setValues,
    error,
    setError,
    constraintValues,
}: IRestrictiveLegalValuesProps) => {
    const [filter, setFilter] = useState('');
    const { legalValues, deletedLegalValues } = data;

    const filteredValues = filterLegalValues(legalValues, filter);

    // Lazily initialise the values because there might be a lot of them.
    const [valuesMap, setValuesMap] = useState(() => createValuesMap(values));
    const { classes: styles } = useThemeStyles();

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
            setValues(newValues);
            return;
        }

        setValues([...cleanDeletedLegalValues(values), legalValue]);
    };

    return (
        <>
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

            <ConstraintFormHeader>
                Select values from a predefined set
            </ConstraintFormHeader>
            <ConditionallyRender
                condition={legalValues.length > 100}
                show={
                    <ConstraintValueSearch
                        filter={filter}
                        setFilter={setFilter}
                    />
                }
            />
            {filteredValues.map((match) => (
                <LegalValueLabel
                    key={match.value}
                    legal={match}
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

            <ConditionallyRender
                condition={Boolean(error)}
                show={<p className={styles.error}>{error}</p>}
            />
        </>
    );
};
