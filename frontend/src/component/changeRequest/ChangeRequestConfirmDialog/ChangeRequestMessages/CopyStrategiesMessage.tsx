import { styled, Typography } from '@mui/material';
import { formatStrategyName } from '../../../../utils/strategyNames';
import { IFeatureStrategy } from '../../../../interfaces/strategy';
import { CopyStrategyMsg } from './CopyStrategyMessage';

const MsgContainer = styled('div')(({ theme }) => ({
    '&>*:nth-child(n)': {
        margin: theme.spacing(1, 0),
    },
}));

export const CopyStrategiesMessage = ({
    payload,
    fromEnvironment,
    environment,
}: CopyStrategyMsg) => (
    <MsgContainer>
        <Typography>
            <strong>Copy: </strong>
        </Typography>
        {(payload as IFeatureStrategy[])?.map(strategy => (
            <Typography>
                <strong>
                    {formatStrategyName((strategy as IFeatureStrategy)?.name)}{' '}
                    strategy{' '}
                </strong>{' '}
            </Typography>
        ))}
        <Typography>
            from {fromEnvironment} to {environment}
        </Typography>
    </MsgContainer>
);
