import { VFC } from 'react';
import { styled, Typography } from '@mui/material';
import { formatStrategyName } from 'utils/strategyNames';
import { IFeatureStrategyPayload } from 'interfaces/strategy';

interface ICopyStrategiesMessageProps {
    payload?: IFeatureStrategyPayload[];
    fromEnvironment?: string;
    environment?: string;
}

const MsgContainer = styled('div')(({ theme }) => ({
    '&>*:nth-child(n)': {
        margin: theme.spacing(1, 0),
    },
}));

export const CopyStrategiesMessage: VFC<ICopyStrategiesMessageProps> = ({
    payload,
    fromEnvironment,
    environment,
}) => (
    <MsgContainer>
        <Typography>
            <strong>Copy: </strong>
        </Typography>
        {payload?.map(strategy => (
            <Typography>
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
