import { useState } from 'react';
import { Chip, styled } from '@mui/material';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { ConstraintValueSearch } from '../../../ConstraintValueSearch/ConstraintValueSearch';

interface IMultipleValuesProps {
    values: string[] | undefined;
}

const StyledTruncator = styled(StringTruncator)({
    whiteSpace: 'pre',
});

const StyledChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(0, 1, 1, 0),
}));

export const MultipleValues = ({ values }: IMultipleValuesProps) => {
    const [filter, setFilter] = useState('');

    if (!values || values.length === 0) return null;

    return (
        <>
            {values.length > 20 ? (
                <ConstraintValueSearch filter={filter} setFilter={setFilter} />
            ) : null}
            {values
                .filter((value) => value.includes(filter))
                .map((value, index) => (
                    <StyledChip
                        key={`${value}-${index}`}
                        label={
                            <StyledTruncator
                                maxWidth='400'
                                text={value}
                                maxLength={50}
                            />
                        }
                    />
                ))}
        </>
    );
};
