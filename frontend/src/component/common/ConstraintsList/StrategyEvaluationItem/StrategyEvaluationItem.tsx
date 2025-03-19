import { styled } from '@mui/material';
import {
    Truncator,
    type TruncatorProps,
} from 'component/common/Truncator/Truncator';
import type { FC, ReactNode } from 'react';

export type StrategyEvaluationItemProps = {
    type?: ReactNode;
    children?: ReactNode;
    values?: string[];
} & Pick<TruncatorProps, 'onSetTruncated'>;

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    fontSize: theme.typography.body2.fontSize,
}));

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
}));

const StyledType = styled('span')(({ theme }) => ({
    display: 'block',
    flexShrink: 0,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,
    width: theme.spacing(10),
}));

/**
 * Abstract building block for a list of constraints, segments and other items inside a strategy
 */
export const StrategyEvaluationItem: FC<StrategyEvaluationItemProps> = ({
    type,
    children,
    values,
    onSetTruncated,
}) => (
    <StyledContainer>
        <StyledType>{type}</StyledType>
        <StyledContent>
            {children}
            {values && values?.length === 1 ? (
                <Truncator
                    title={values[0]}
                    arrow
                    lines={2}
                    onSetTruncated={() => onSetTruncated?.(false)}
                >
                    {values[0]}
                </Truncator>
            ) : null}
            {values && values?.length > 1 ? (
                <Truncator title='' lines={2} onSetTruncated={onSetTruncated}>
                    {values.join(', ')}
                </Truncator>
            ) : null}
        </StyledContent>
    </StyledContainer>
);
