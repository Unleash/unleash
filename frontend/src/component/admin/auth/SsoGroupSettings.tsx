import type React from 'react';
import { FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface SsoGroupSettingsProps {
    ssoType: 'OIDC' | 'SAML';
    data?: {
        enabled: boolean;
        enableGroupSyncing: boolean;
        groupJsonPath: string;
        addGroupsScope: boolean;
    };
    setValue: (name: string, value: string | boolean) => void;
    disabled?: boolean;
}

export const SsoGroupSettings = ({
    ssoType,
    data = {
        enabled: false,
        enableGroupSyncing: false,
        groupJsonPath: '',
        addGroupsScope: false,
    },
    setValue,
    disabled = false,
}: SsoGroupSettingsProps) => {
    const updateGroupSyncing = () => {
        setValue('enableGroupSyncing', !data.enableGroupSyncing);
    };

    const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.name, event.target.value);
    };

    const updateAddGroupScope = () => {
        setValue('addGroupsScope', !data.addGroupsScope);
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
                                name='enableGroupSyncing'
                                checked={data.enableGroupSyncing}
                                disabled={!data.enabled || disabled}
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
                        label='Group JSON Path'
                        name='groupJsonPath'
                        value={data.groupJsonPath}
                        disabled={!data.enableGroupSyncing || disabled}
                        style={{ width: '400px' }}
                        variant='outlined'
                        size='small'
                        required
                    />
                </Grid>
            </Grid>
            <ConditionallyRender
                condition={ssoType === 'OIDC'}
                show={
                    <Grid container spacing={3} mb={2}>
                        <Grid item md={5}>
                            <strong>Request 'groups' Scope</strong>
                            <p>
                                When enabled Unleash will also request the
                                'groups' scope as part of the login request.
                            </p>
                        </Grid>
                        <Grid item md={6} style={{ padding: '20px' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        onChange={updateAddGroupScope}
                                        value={data.addGroupsScope}
                                        disabled={
                                            !data.enableGroupSyncing || disabled
                                        }
                                        name='addGroupsScope'
                                        checked={data.addGroupsScope}
                                    />
                                }
                                label={
                                    data.addGroupsScope ? 'Enabled' : 'Disabled'
                                }
                            />
                        </Grid>
                    </Grid>
                }
            />
        </>
    );
};
