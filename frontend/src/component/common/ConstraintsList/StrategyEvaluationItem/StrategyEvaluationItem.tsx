import { Chip, type ChipProps, styled } from '@mui/material';
import type { FC, ReactNode } from 'react';

type StrategyItemProps = {
    type?: ReactNode;
    children?: ReactNode;
    values?: string[];
};

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    fontSize: theme.typography.body2.fontSize,
    padding: theme.spacing(2, 3),
}));

const StyledType = styled('span')(({ theme }) => ({
    display: 'block',
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,
    width: theme.spacing(10),
}));

const StyledValuesGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledValue = styled(({ ...props }: ChipProps) => (
    <Chip size='small' {...props} />
))(({ theme }) => ({
    padding: theme.spacing(0.5),
    background: theme.palette.background.elevation1,
}));

/**
 * Abstract building block for a list of constraints, segments and other items inside a strategy
 */
export const StrategyEvaluationItem: FC<StrategyItemProps> = ({
    type,
    children,
    values,
}) => (
    <StyledContainer>
        <StyledType>{type}</StyledType>
        {children}
        {values && values?.length > 0 ? (
            <StyledValuesGroup>
                {values?.map((value, index) => (
                    <StyledValue key={`${value}#${index}`} label={value} />
                ))}
            </StyledValuesGroup>
        ) : null}
    </StyledContainer>
);
