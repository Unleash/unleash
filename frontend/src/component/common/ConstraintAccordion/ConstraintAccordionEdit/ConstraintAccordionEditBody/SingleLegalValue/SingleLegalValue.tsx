import { useState } from 'react';
import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';
import {
    FormControl,
    FormLabel,
    FormControlLabel,
    RadioGroup,
    Radio,
} from '@material-ui/core';
import { ConstraintValueSearch } from 'component/common/ConstraintAccordion/ConstraintValueSearch/ConstraintValueSearch';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { useCommonStyles } from 'common.styles';

// Parent component

interface ISingleLegalValueProps {
    setValue: (value: string) => void;
    value?: string;
    type: string;
    legalValues: string[];
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

export const SingleLegalValue = ({
    setValue,
    value,
    type,
    legalValues,
    error,
    setError,
}: ISingleLegalValueProps) => {
    const [filter, setFilter] = useState('');
    const styles = useCommonStyles();

    return (
        <>
            <ConstraintFormHeader>
                Add a single {type.toLowerCase()} value
            </ConstraintFormHeader>

            <ConstraintValueSearch filter={filter} setFilter={setFilter} />
            <ConditionallyRender
                condition={Boolean(legalValues.length)}
                show={
                    <FormControl component="fieldset">
                        <FormLabel component="legend">
                            Available values
                        </FormLabel>
                        <RadioGroup
                            aria-label="selected-value"
                            name="selected"
                            value={value}
                            onChange={e => {
                                setError('');
                                setValue(e.target.value);
                            }}
                        >
                            <RadioOptions
                                legalValues={legalValues}
                                filter={filter}
                            />
                        </RadioGroup>
                    </FormControl>
                }
                elseShow={
                    <p>No valid legal values available for this operator.</p>
                }
            />
            <ConditionallyRender
                condition={Boolean(error)}
                show={<p className={styles.error}>{error}</p>}
            />
        </>
    );
};

// Child components
interface IRadioOptionsProps {
    legalValues: string[];
    filter: string;
}

const RadioOptions = ({ legalValues, filter }: IRadioOptionsProps) => {
    return (
        <>
            {legalValues
                .filter(legalValue => legalValue.includes(filter))
                .map((value, index) => {
                    return (
                        <FormControlLabel
                            key={`${value}-${index}`}
                            value={value}
                            control={<Radio />}
                            label={value}
                        />
                    );
                })}
        </>
    );
};
