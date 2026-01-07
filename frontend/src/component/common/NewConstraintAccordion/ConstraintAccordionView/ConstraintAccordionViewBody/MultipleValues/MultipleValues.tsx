import { useState } from 'react';
import { Chip, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { ConstraintValueSearch as NewConstraintValueSearch } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint/ConstraintValueSearch';

interface IMultipleValuesProps {
    values: string[] | undefined;
}

const StyledTruncator = styled(StringTruncator)({
    whiteSpace: 'pre',
});

const StyledChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(0, 1, 1, 0),
}));

const SearchWrapper = styled('div')(({ theme }) => ({
    width: '300px',
    marginBottom: theme.spacing(2),
}));

export const MultipleValues = ({ values }: IMultipleValuesProps) => {
    const [filter, setFilter] = useState('');

    if (!values || values.length === 0) return null;

    return (
        <>
            <ConditionallyRender
                condition={values.length > 20}
                show={
                    <SearchWrapper>
                        <NewConstraintValueSearch
                            filter={filter}
                            setFilter={setFilter}
                        />
                    </SearchWrapper>
                }
            />
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
