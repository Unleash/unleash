import { useState } from 'react';
import { Chip } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { ConstraintValueSearch } from '../../../ConstraintValueSearch/ConstraintValueSearch';
import { useStyles } from '../ConstraintAccordionViewBody.style';

interface IMultipleValuesProps {
    values: string[] | undefined;
}

export const MultipleValues = ({ values }: IMultipleValuesProps) => {
    const [filter, setFilter] = useState('');
    const { classes: styles } = useStyles();

    if (!values || values.length === 0) return null;

    return (
        <>
            <ConditionallyRender
                condition={values.length > 20}
                show={
                    <ConstraintValueSearch
                        filter={filter}
                        setFilter={setFilter}
                    />
                }
            />
            {values
                .filter(value => value.includes(filter))
                .map((value, index) => (
                    <Chip
                        key={`${value}-${index}`}
                        label={
                            <StringTruncator
                                maxWidth="400"
                                text={value}
                                maxLength={50}
                                className={styles.chipValue}
                            />
                        }
                        className={styles.chip}
                    />
                ))}
        </>
    );
};
