import { Chip, Button, styled } from '@mui/material';
import { useMemo } from 'react';
import { focusable } from 'themes/themeStyles';

interface IFeatureMetricsChipsProps {
    title: string;
    values: Set<string>;
    selectedValues: string[];
    toggleValue: (value: string) => void;
    toggleValues?: () => void;
}

const StyledTitle = styled('h2')(({ theme }) => ({
    margin: 0,
    marginBottom: theme.spacing(1.5),
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.thin,
    color: theme.palette.text.secondary,
}));

const StyledList = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    listStyleType: 'none',
    padding: 0,
    minHeight: '100%',
    alignItems: 'center',
    maxHeight: '200px',
    overflowY: 'auto',
}));

const StyledItem = styled('li')(({ theme }) => ({
    '& > [aria-pressed=true]': {
        backgroundColor: theme.palette.background.alternative,
        color: theme.palette.primary.contrastText,
    },
    '& > [aria-pressed=true]:hover': {
        backgroundColor: theme.palette.primary.light,
    },
}));

export const FeatureMetricsChips = ({
    title,
    values,
    selectedValues,
    toggleValue,
    toggleValues,
}: IFeatureMetricsChipsProps) => {
    const onClick = (value: string) => () => {
        toggleValue(value);
    };
    const allSelected = [...values].every((element) =>
        selectedValues.includes(element),
    );

    const sortedValues = useMemo(() => {
        return Array.from(values).sort((valueA, valueB) => {
            return valueA.localeCompare(valueB);
        });
    }, [values]);

    return (
        <div>
            <StyledTitle>{title}</StyledTitle>
            <StyledList>
                {toggleValues && values.size > 1 && (
                    <Button
                        size={'small'}
                        onClick={toggleValues}
                        aria-pressed={allSelected}
                    >
                        {allSelected ? 'Unselect' : 'Select all'}
                    </Button>
                )}
                {sortedValues.map((val) => (
                    <StyledItem key={val}>
                        <Chip
                            label={val}
                            onClick={onClick(val)}
                            aria-pressed={selectedValues?.includes(val)}
                            sx={focusable}
                            data-testid={
                                selectedValues?.includes(val)
                                    ? `selected-chip-${val}`
                                    : `unselected-chip-${val}`
                            }
                        />
                    </StyledItem>
                ))}
            </StyledList>
        </div>
    );
};
