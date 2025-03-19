import { styled } from '@mui/material';
import { disabledStrategyClassName } from 'component/common/StrategyItemContainer/disabled-strategy-utils';
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
}));

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    alignItems: 'center',
    [`.${disabledStrategyClassName} &`]: {
        filter: 'grayscale(1)',
        color: theme.palette.text.secondary,
    },
}));

const StyledType = styled('span')(({ theme }) => ({
    display: 'block',
    flexShrink: 0,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,
    width: theme.spacing(10),
}));

const StyledValuesGroup = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    listStyle: 'none',
    padding: 0,
}));

const StyledValue = styled('li')(({ theme }) => ({
    [`.${disabledStrategyClassName} &`]: {
        filter: 'grayscale(1)',
        color: theme.palette.text.secondary,
    },
    ':not(&:last-of-type)::after': {
        content: '", "',
    },
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
        <StyledContent>
            {children}
            {values && values?.length > 0 ? (
                <StyledValuesGroup>
                    {values?.map((value, index) => (
                        <StyledValue key={`${value}#${index}`}>
                            {value}
                        </StyledValue>
                    ))}
                </StyledValuesGroup>
            ) : null}
        </StyledContent>
    </StyledContainer>
);
