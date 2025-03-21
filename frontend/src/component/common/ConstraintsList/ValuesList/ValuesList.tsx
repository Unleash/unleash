import type { FC } from 'react';
import { styled, Tooltip } from '@mui/material';
import {
    Truncator,
    type TruncatorProps,
} from 'component/common/Truncator/Truncator';

export type ValuesListProps = {
    values?: string[];
    tooltips?: Record<string, string | undefined>;
} & Pick<TruncatorProps, 'onSetTruncated'>;

const StyledValuesContainer = styled('div')({
    flex: '1 1 0',
});

const StyledValueItem = styled('span')(({ theme }) => ({
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
                    <Tooltip title={tooltips?.[values[0]] || ''}>
                        <span>{values[0]}</span>
                    </Tooltip>
                </Truncator>
            </StyledSingleValue>
        ) : null}
        {values && values?.length > 1 ? (
            <Truncator title='' lines={2} onSetTruncated={onSetTruncated}>
                {values.map((value) => (
                    <Tooltip title={tooltips?.[value] || ''} key={value}>
                        <StyledValueItem>
                            <span>{value}</span>
                        </StyledValueItem>
                    </Tooltip>
                ))}
            </Truncator>
        ) : null}
    </StyledValuesContainer>
);
