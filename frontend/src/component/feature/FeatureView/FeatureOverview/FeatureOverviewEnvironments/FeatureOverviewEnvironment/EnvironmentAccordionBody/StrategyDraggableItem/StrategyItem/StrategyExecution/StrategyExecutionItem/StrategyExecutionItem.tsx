import { styled } from '@mui/material';
import type { FC, ReactNode } from 'react';

type StrategyItemProps = {
    type?: string;
    children: ReactNode;
};

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    fontSize: theme.typography.body2.fontSize,
}));

const StyledType = styled('span')(({ theme }) => ({
    display: 'block',
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,
    width: theme.spacing(10),
}));

/**
 * Abstract building block for a list of constraints, segments and other items inside a strategy
 */
export const StrategyExecutionItem: FC<StrategyItemProps> = ({
    type,
    children,
}) => (
    <StyledContainer>
        <StyledType>{type}</StyledType> {children}
    </StyledContainer>
);
