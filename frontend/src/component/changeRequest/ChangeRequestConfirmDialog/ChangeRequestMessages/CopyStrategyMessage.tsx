import { Typography } from '@mui/material';
import { formatStrategyName } from '../../../../utils/strategyNames';
import { IFeatureStrategy } from '../../../../interfaces/strategy';

export interface CopyStrategyMsg {
    payload: IFeatureStrategy | IFeatureStrategy[];
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
            Copy {formatStrategyName((payload as IFeatureStrategy)?.name)}{' '}
            strategy{' '}
        </strong>{' '}
        from {fromEnvironment} to {environment}
    </Typography>
);
