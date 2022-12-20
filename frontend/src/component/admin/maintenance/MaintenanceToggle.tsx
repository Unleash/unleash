import React from 'react';
import {
    Box,
    Card,
    CardContent,
    FormControlLabel,
    styled,
    Switch,
    Typography,
} from '@mui/material';
import { useMaintenance } from '../../../hooks/api/getters/useMaintenance/useMaintenance';
import { useMaintenanceApi } from '../../../hooks/api/actions/useMaintenanceApi/useMaintenanceApi';

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2.5),
    border: `1px solid ${theme.palette.dividerAlternative}`,
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.boxShadows.card,
    fontSize: theme.fontSizes.smallBody,
}));

const CardTitleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
}));

const CardDescription = styled(Box)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const SwitchLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

export const MaintenanceToggle = () => {
    const { enabled, refetchMaintenance } = useMaintenance();
    const { toggleMaintenance } = useMaintenanceApi();
    const updateEnabled = async () => {
        await toggleMaintenance({ enabled: !enabled });
        refetchMaintenance();
    };

    return (
        <StyledCard>
            <CardContent>
                <CardTitleRow>
                    <b>Maintenance Mode</b>
                    <FormControlLabel
                        sx={{ fontSize: '10px' }}
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
                    Maintenance Mode is useful when you want to freeze your
                    system so nobody can do any changes during this time. When
                    enabled it will show a banner at the top of the applications
                    and only an admin can enable it or disable it.
                </CardDescription>
            </CardContent>
        </StyledCard>
    );
};
