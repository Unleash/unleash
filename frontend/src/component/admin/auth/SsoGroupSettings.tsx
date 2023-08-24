import React, { Fragment } from 'react';
import { FormControlLabel, Grid, Switch, TextField } from '@mui/material';

interface SsoGroupSettingsProps {
    ssoType: 'OIDC' | 'SAML';
    data?: {
        enabled: boolean;
        enableGroupSyncing: boolean;
        groupJsonPath: string;
        enableGroupScope: boolean;
    };
    setValue: (name: string, value: string | boolean) => void;
}

export const SsoGroupSettings = ({
    ssoType,
    data = {
        enabled: false,
        enableGroupSyncing: false,
        groupJsonPath: '',
        enableGroupScope: false,
    },
    setValue,
}: SsoGroupSettingsProps) => {
    const updateGroupSyncing = () => {
        setValue('enableGroupSyncing', !data.enableGroupSyncing);
    };

    const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.name, event.target.value);
    };

    const updateGroupScope = () => {
        setValue('enableGroupScope', !data.enableGroupScope);
    }
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
            <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Request 'groups' Scope</strong>
                        <p>
                            When enabled Unleash will also request the 'groups' scope as part of the login request.
                        </p>
                    </Grid>
                    <Grid item md={6} style={{ padding: '20px' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    onChange={updateGroupScope}
                                    value={data.enableGroupScope}
                                    disabled={!data.enableGroupSyncing}
                                    name="enableGroupScope"
                                    checked={data.enableGroupScope}
                                />
                            }
                            label={
                                data.enableGroupScope
                                    ? 'Enabled'
                                    : 'Disabled'
                            }
                        />
                    </Grid>
                </Grid>
            </>
    );
};
