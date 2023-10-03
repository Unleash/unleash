import { Typography } from '@mui/material';

interface UpdateEnabledMsg {
    enabled: boolean;
    featureName: string;
    environment: string;
}

export const UpdateEnabledMessage = ({
    enabled,
    featureName,
    environment,
}: UpdateEnabledMsg) => (
    <Typography data-testid="update-enabled-message">
        <strong>{enabled ? 'Enable' : 'Disable'}</strong> feature toggle{' '}
        <strong>{featureName}</strong> in <strong>{environment}</strong>
    </Typography>
);
