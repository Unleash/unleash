import { Box, Chip, styled } from '@mui/material';

const StyledChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'isActive',
})<{
    isActive?: boolean;
}>(({ theme, isActive = false }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5),
    fontSize: theme.fontSizes.smallerBody,
    height: 'auto',
    ...(isActive && {
        backgroundColor: theme.palette.secondary.light,
        fontWeight: 'bold',
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
    }),
    ':focus-visible': {
        outline: `1px solid ${theme.palette.primary.main}`,
        borderColor: theme.palette.primary.main,
    },
}));

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
}));

interface IQuickFiltersProps<T> {
    filters: Array<{ label: string; value: T }>;
    value: T;
    onChange: (value: T) => void;
}

export const QuickFilters = <T extends string | null>({
    filters,
    value: currentValue,
    onChange,
}: IQuickFiltersProps<T>) => (
    <StyledContainer>
        {filters.map(({ label, value }) => (
            <StyledChip
                key={label}
                data-loading
                label={label}
                variant='outlined'
                isActive={value === currentValue}
                onClick={() => onChange(value)}
            />
        ))}
    </StyledContainer>
);
