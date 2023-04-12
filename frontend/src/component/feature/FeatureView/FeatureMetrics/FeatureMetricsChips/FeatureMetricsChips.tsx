import { Chip, styled } from '@mui/material';
import { useMemo } from 'react';
import { focusable } from 'themes/themeStyles';

interface IFeatureMetricsChipsProps {
    title: string;
    values: Set<string>;
    value?: string;
    setValue: (value: string) => void;
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
    value,
    setValue,
}: IFeatureMetricsChipsProps) => {
    const onClick = (value: string) => () => {
        if (values.has(value)) {
            setValue(value);
        }
    };

    const sortedValues = useMemo(() => {
        return Array.from(values).sort((valueA, valueB) => {
            return valueA.localeCompare(valueB);
        });
    }, [values]);

    return (
        <div>
            <StyledTitle>{title}</StyledTitle>
            <StyledList>
                {sortedValues.map(val => (
                    <StyledItem key={val}>
                        <Chip
                            label={val}
                            onClick={onClick(val)}
                            aria-pressed={val === value}
                            sx={focusable}
                        />
                    </StyledItem>
                ))}
            </StyledList>
        </div>
    );
};
