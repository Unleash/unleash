import React from 'react';
import {
    Box,
    FormControlLabel,
    styled,
    Switch,
    Typography,
} from '@mui/material';
import { useMaintenance } from 'hooks/api/getters/useMaintenance/useMaintenance';
import { useMaintenanceApi } from 'hooks/api/actions/useMaintenanceApi/useMaintenanceApi';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useToast from 'hooks/useToast';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const CardTitleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const CardDescription = styled(Box)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(2),
}));

const SwitchLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

export const MaintenanceToggle = () => {
    const { enabled, refetchMaintenance } = useMaintenance();
    const { toggleMaintenance } = useMaintenanceApi();
    const { trackEvent } = usePlausibleTracker();
    const { setToastData } = useToast();
    const updateEnabled = async () => {
        setToastData({
            type: 'success',
            title: `Maintenance mode has been successfully ${
                enabled ? 'disabled' : 'enabled'
            }`,
        });
        trackEvent('maintenance', {
            props: {
                eventType: `maintenance ${enabled ? 'de' : ''}activated`,
            },
        });
        await toggleMaintenance({ enabled: !enabled });
        refetchMaintenance();
    };

    return (
        <StyledContainer>
            <CardTitleRow>
                <b>Maintenance Mode</b>
                <FormControlLabel
                    sx={{ margin: 0 }}
                    control={
                        <Switch
                            onChange={updateEnabled}
                            value={enabled}
                            name="enabled"
                            checked={enabled}
                        />
                    }
                    label={
                        <SwitchLabel>
                            {enabled ? 'Enabled' : 'Disabled'}
                        </SwitchLabel>
                    }
                />
            </CardTitleRow>
            <CardDescription>
                Maintenance Mode is useful when you want to freeze your system
                so nobody can do any changes during this time. When enabled it
                will show a banner at the top of the applications and only an
                admin can enable it or disable it.
            </CardDescription>
        </StyledContainer>
    );
};
