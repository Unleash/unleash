import { useEffect, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Checkbox } from '@mui/material';
import { useThemeStyles } from 'themes/themeStyles';
import { ConstraintValueSearch } from 'component/common/ConstraintAccordion/ConstraintValueSearch/ConstraintValueSearch';
import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';
import { ILegalValue } from 'interfaces/context';
import {
    filterLegalValues,
    LegalValueLabel,
} from '../LegalValueLabel/LegalValueLabel';

interface IRestrictiveLegalValuesProps {
    data: {
        legalValues: ILegalValue[];
        deletedLegalValues: ILegalValue[];
    };
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

export const RestrictiveLegalValues = ({
    data,
    values,
    setValues,
    error,
    setError,
}: IRestrictiveLegalValuesProps) => {
    const [filter, setFilter] = useState('');
    const { legalValues, deletedLegalValues } = data;
    const filteredValues = filterLegalValues(legalValues, filter);

    // Lazily initialise the values because there might be a lot of them.
    const [valuesMap, setValuesMap] = useState(() => createValuesMap(values));
    const { classes: styles } = useThemeStyles();

    useEffect(() => {
        setValuesMap(createValuesMap(values));
    }, [values, setValuesMap]);

    const cleanDeletedLegalValues = (constraintValues: string[]): string[] => {
        const deletedValuesSet = new Set(deletedLegalValues.map(v => v.value));
        return (
            constraintValues?.filter(value => !deletedValuesSet.has(value)) ||
            []
        );
    };

    const onChange = (legalValue: string) => {
        setError('');

        if (valuesMap[legalValue]) {
            const index = values.findIndex(value => value === legalValue);
            const newValues = [...values];
            newValues.splice(index, 1);
            setValues(newValues);
            return;
        }

        setValues([...cleanDeletedLegalValues(values), legalValue]);
    };

    return (
        <>
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
            {filteredValues.concat(deletedLegalValues).map(match => (
                <LegalValueLabel
                    key={match.value}
                    legal={match}
                    control={
                        <Checkbox
                            checked={Boolean(valuesMap[match.value])}
                            onChange={() => onChange(match.value)}
                            name={match.value}
                            color="primary"
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
