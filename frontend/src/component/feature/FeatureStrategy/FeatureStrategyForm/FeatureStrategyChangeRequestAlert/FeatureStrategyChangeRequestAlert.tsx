import type { FC } from 'react';
import { Alert } from '@mui/material';

interface IFeatureStrategyChangeRequestAlertProps {
    environment?: string;
}

export const FeatureStrategyChangeRequestAlert: FC<
    IFeatureStrategyChangeRequestAlertProps
> = ({ environment }) => (
    <Alert severity='info'>
        <strong>Change requests</strong> are enabled
        {environment ? ` for ${environment}` : ''}. Changes go into a draft you
        can submit for review.
    </Alert>
);
