import React, { Fragment } from 'react';
import { FormControlLabel, Grid, Switch, TextField } from '@mui/material';

interface SsoGroupSettingsProps {
    ssoType: 'OIDC' | 'SAML';
    data?: {
        enabled: boolean;
        enableGroupSyncing: boolean;
        groupJsonPath: string;
    };
    setValue: (name: string, value: string | boolean) => void;
}

export const SsoGroupSettings = ({
    ssoType,
    data = {
        enabled: false,
        enableGroupSyncing: false,
        groupJsonPath: '',
    },
    setValue,
}: SsoGroupSettingsProps) => {
    const updateGroupSyncing = () => {
        setValue('enableGroupSyncing', !data.enableGroupSyncing);
    };

    const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.name, event.target.value);
    };

    return (
        <>
            <Grid container spacing={3} mb={2}>
                <Grid item md={5}>
                    <strong>Enable Group Syncing</strong>
                    <p>
                        Enables automatically syncing of users from the{' '}
                        {ssoType}
                        provider when a user logs in.
                    </p>
                </Grid>
                <Grid item md={6} style={{ padding: '20px' }}>
                    <FormControlLabel
                        control={
                            <Switch
                                onChange={updateGroupSyncing}
                                value={data.enableGroupSyncing}
                                name="enableGroupSyncing"
                                checked={data.enableGroupSyncing}
                                disabled={!data.enabled}
                            />
                        }
                        label={data.enableGroupSyncing ? 'Enabled' : 'Disabled'}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={3} mb={2}>
                <Grid item md={5}>
                    <strong>Group Field JSON Path</strong>
                    <p>
                        Specifies the path in the {ssoType} token response from
                        which to read the groups the user belongs to.
                    </p>
                </Grid>
                <Grid item md={6}>
                    <TextField
                        onChange={updateField}
                        label="Group JSON Path"
                        name="groupJsonPath"
                        value={data.groupJsonPath}
                        disabled={!data.enableGroupSyncing}
                        style={{ width: '400px' }}
                        variant="outlined"
                        size="small"
                        required
                    />
                </Grid>
            </Grid>
        </>
    );
};
