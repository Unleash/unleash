import type { FC } from 'react';
import { styled } from '@mui/material';
import {
    Truncator,
    type TruncatorProps,
} from 'component/common/Truncator/Truncator';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';

export type ValuesListProps = {
    values?: string[];
    tooltips?: Record<string, string | undefined>;
} & Pick<TruncatorProps, 'onSetTruncated'>;

const StyledValuesContainer = styled('div')(({ theme }) => ({
    flex: '1 1 0',
    [theme.breakpoints.down('sm')]: {
        display: 'block',
        float: 'left',
    },
}));

const StyledTruncator = styled(Truncator)({
    padding: 0,
    margin: 0,
});

const StyledValueItem = styled('li')(({ theme }) => ({
    padding: theme.spacing(0.25),
    display: 'inline-block',
    span: {
        background: theme.palette.background.elevation2,
        borderRadius: theme.shape.borderRadiusLarge,
        display: 'inline-block',
        padding: theme.spacing(0.25, 1),
    },
}));

const StyledSingleValue = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.25, 1),
    background: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusLarge,
}));

export const ValuesList: FC<ValuesListProps> = ({
    values,
    tooltips,
    onSetTruncated,
}) => (
    <StyledValuesContainer>
        {values && values?.length === 1 ? (
            <StyledSingleValue>
                <Truncator
                    title={values[0]}
                    arrow
                    lines={2}
                    onSetTruncated={() => onSetTruncated?.(false)}
                >
                    <TooltipResolver title={tooltips?.[values[0]] || ''}>
                        <span>{values[0]}</span>
                    </TooltipResolver>
                </Truncator>
            </StyledSingleValue>
        ) : null}
        {values && values?.length > 1 ? (
            <StyledTruncator
                title=''
                lines={2}
                onSetTruncated={onSetTruncated}
                component='ul'
            >
                {values.map((value) => (
                    <TooltipResolver
                        title={tooltips?.[value] || ''}
                        key={value}
                    >
                        <StyledValueItem>
                            <span>{value}</span>
                        </StyledValueItem>
                    </TooltipResolver>
                ))}
            </StyledTruncator>
        ) : null}
    </StyledValuesContainer>
);
