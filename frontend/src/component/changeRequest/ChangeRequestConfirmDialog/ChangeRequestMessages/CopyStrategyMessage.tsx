import { Typography } from '@mui/material';
import { formatStrategyName } from 'utils/strategyNames';
import { IFeatureStrategyPayload } from 'interfaces/strategy';

export interface CopyStrategyMsg {
    payload?: IFeatureStrategyPayload;
    fromEnvironment?: string;
    environment?: string;
}

export const CopyStrategyMessage = ({
    payload,
    fromEnvironment,
    environment,
}: CopyStrategyMsg) => (
    <Typography>
        <strong>
            Copy {formatStrategyName(payload?.name || '')} strategy{' '}
        </strong>{' '}
        from {fromEnvironment} to {environment}
    </Typography>
);
