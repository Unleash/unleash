import type React from 'react';
import { useState } from 'react';
import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';
import { FormControl, RadioGroup, Radio, Alert, styled } from '@mui/material';
import { ConstraintValueSearch } from 'component/common/ConstraintAccordion/ConstraintValueSearch/ConstraintValueSearch';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useThemeStyles } from 'themes/themeStyles';
import type { ILegalValue } from 'interfaces/context';
import {
    LegalValueLabel,
    filterLegalValues,
} from '../LegalValueLabel/LegalValueLabel';
import { getIllegalValues } from '../RestrictiveLegalValues/RestrictiveLegalValues';

interface ISingleLegalValueProps {
    setValue: (value: string) => void;
    value?: string;
    type: string;
    legalValues: ILegalValue[];
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
    data: {
        legalValues: ILegalValue[];
        deletedLegalValues: ILegalValue[];
    };
    constraintValue: string;
}

const StyledFieldsetContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    maxHeight: '378px',
    overflow: 'auto',
}));

export const SingleLegalValue = ({
    setValue,
    value,
    type,
    legalValues,
    error,
    setError,
    data,
    constraintValue,
}: ISingleLegalValueProps) => {
    const [filter, setFilter] = useState('');
    const { classes: styles } = useThemeStyles();
    const filteredValues = filterLegalValues(legalValues, filter);

    const { deletedLegalValues } = data;

    const illegalValues = getIllegalValues(
        [constraintValue],
        deletedLegalValues,
    );

    return (
        <>
            <ConditionallyRender
                condition={Boolean(illegalValues && illegalValues.length > 0)}
                show={
                    <Alert
                        severity='warning'
                        sx={(theme) => ({ marginTop: theme.spacing(1) })}
                    >
                        {' '}
                        This constraint is using legal values that have been
                        deleted as a valid option. Please select a new value
                        from the remaining predefined legal values. The
                        constraint will be updated with the new value when you
                        save the strategy.
                    </Alert>
                }
            />
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
                    <StyledFieldsetContainer>
                        <FormControl component='fieldset'>
                            <RadioGroup
                                aria-label='selected-value'
                                name='selected'
                                value={value}
                                sx={{ gap: (theme) => theme.spacing(0.5) }}
                                onChange={(e) => {
                                    setError('');
                                    setValue(e.target.value);
                                }}
                            >
                                {filteredValues.map((match) => (
                                    <LegalValueLabel
                                        key={match.value}
                                        legal={match}
                                        control={<Radio />}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </StyledFieldsetContainer>
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
