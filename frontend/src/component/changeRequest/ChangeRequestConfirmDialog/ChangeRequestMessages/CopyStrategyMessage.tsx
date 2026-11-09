import { Typography } from '@mui/material';
import type { FeatureStrategySchema } from 'openapi';
import { formatStrategyName } from 'utils/strategyNames';

export interface CopyStrategyMsg {
    payload?: FeatureStrategySchema;
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
