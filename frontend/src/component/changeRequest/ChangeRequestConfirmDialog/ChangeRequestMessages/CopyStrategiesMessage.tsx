import type { FC } from 'react';
import { styled, Typography } from '@mui/material';
import { formatStrategyName } from 'utils/strategyNames';
import type { FeatureStrategySchema } from 'openapi';

interface ICopyStrategiesMessageProps {
    payload?: FeatureStrategySchema[];
    fromEnvironment?: string;
    environment?: string;
}

const MsgContainer = styled('div')(({ theme }) => ({
    '&>*:nth-child(n)': {
        margin: theme.spacing(1, 0),
    },
}));

export const CopyStrategiesMessage: FC<ICopyStrategiesMessageProps> = ({
    payload,
    fromEnvironment,
    environment,
}) => (
    <MsgContainer>
        <Typography>
            <strong>Copy: </strong>
        </Typography>
        {payload?.map((strategy) => (
            <Typography key={strategy.id}>
                <strong>
                    {formatStrategyName(strategy?.name || '')} strategy{' '}
                </strong>{' '}
            </Typography>
        ))}
        <Typography>
            from {fromEnvironment} to {environment}
        </Typography>
    </MsgContainer>
);
