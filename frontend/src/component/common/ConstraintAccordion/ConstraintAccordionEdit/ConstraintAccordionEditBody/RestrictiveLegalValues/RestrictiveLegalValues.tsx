import { Checkbox, FormControlLabel } from '@material-ui/core';
import { useCommonStyles } from 'common.styles';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { useEffect, useState } from 'react';
import { ConstraintValueSearch } from 'component/common/ConstraintAccordion/ConstraintValueSearch/ConstraintValueSearch';
import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';

// Parent component
interface IRestrictiveLegalValuesProps {
    legalValues: string[];
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
    legalValues,
    values,
    setValues,
    error,
    setError,
}: IRestrictiveLegalValuesProps) => {
    const [filter, setFilter] = useState('');
    // Lazily initialise the values because there might be a lot of them.
    const [valuesMap, setValuesMap] = useState(() => createValuesMap(values));
    const styles = useCommonStyles();

    useEffect(() => {
        setValuesMap(createValuesMap(values));
    }, [values, setValuesMap]);

    const onChange = (legalValue: string) => {
        setError('');
        if (valuesMap[legalValue]) {
            const index = values.findIndex(value => value === legalValue);
            const newValues = [...values];
            newValues.splice(index, 1);
            setValues(newValues);
            return;
        }

        setValues([...values, legalValue]);
    };

    return (
        <>
            <ConstraintFormHeader>
                Select values from a predefined set
            </ConstraintFormHeader>
            <ConstraintValueSearch filter={filter} setFilter={setFilter} />
            <LegalValueOptions
                legalValues={legalValues}
                filter={filter}
                onChange={onChange}
                valuesMap={valuesMap}
            />
            <ConditionallyRender
                condition={Boolean(error)}
                show={<p className={styles.error}>{error}</p>}
            />
        </>
    );
};

// Child component
interface ILegalValueOptionsProps {
    legalValues: string[];
    filter: string;
    onChange: (legalValue: string) => void;
    valuesMap: IValuesMap;
}

const LegalValueOptions = ({
    legalValues,
    filter,
    onChange,
    valuesMap,
}: ILegalValueOptionsProps) => {
    return (
        <>
            {legalValues
                .filter(legalValue => legalValue.includes(filter))
                .map(legalValue => {
                    return (
                        <FormControlLabel
                            key={legalValue}
                            control={
                                <Checkbox
                                    checked={Boolean(valuesMap[legalValue])}
                                    onChange={() => onChange(legalValue)}
                                    color="primary"
                                    name={legalValue}
                                />
                            }
                            label={legalValue}
                        />
                    );
                })}
        </>
    );
};
