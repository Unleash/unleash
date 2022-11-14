import { VFC } from 'react';
import { Typography } from '@mui/material';
import { formatStrategyName } from 'utils/strategyNames';
import { IFeatureStrategyPayload } from 'interfaces/strategy';

interface IAddStrategyMessageProps {
    payload?: IFeatureStrategyPayload;
    environment?: string;
}

export const AddStrategyMessage: VFC<IAddStrategyMessageProps> = ({
    payload,
    environment,
}) => (
    <>
        <Typography component="span">Add </Typography>
        <strong>
            {formatStrategyName(payload?.name || '')} strategy
        </strong> to <strong>{environment}</strong>
    </>
);
