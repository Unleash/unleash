import React, { useState } from 'react';
import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';
import { FormControl, RadioGroup, Radio } from '@mui/material';
import { ConstraintValueSearch } from 'component/common/ConstraintAccordion/ConstraintValueSearch/ConstraintValueSearch';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useThemeStyles } from 'themes/themeStyles';
import { ILegalValue } from 'interfaces/context';
import {
    LegalValueLabel,
    filterLegalValues,
} from '../LegalValueLabel/LegalValueLabel';

interface ISingleLegalValueProps {
    setValue: (value: string) => void;
    value?: string;
    type: string;
    legalValues: ILegalValue[];
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
    const { classes: styles } = useThemeStyles();
    const filteredValues = filterLegalValues(legalValues, filter);

    return (
        <>
            <ConstraintFormHeader>
                Add a single {type.toLowerCase()} value
            </ConstraintFormHeader>
            <ConditionallyRender
                condition={Boolean(legalValues.length > 100)}
                show={
                    <ConstraintValueSearch
                        filter={filter}
                        setFilter={setFilter}
                    />
                }
            />
            <ConditionallyRender
                condition={Boolean(legalValues.length)}
                show={
                    <FormControl component="fieldset">
                        <RadioGroup
                            aria-label="selected-value"
                            name="selected"
                            value={value}
                            onChange={e => {
                                setError('');
                                setValue(e.target.value);
                            }}
                        >
                            {filteredValues.map(match => (
                                <LegalValueLabel
                                    key={match.value}
                                    legal={match}
                                    control={<Radio />}
                                />
                            ))}
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
