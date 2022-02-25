import React, { useContext, useEffect, useState } from 'react';
import {
    Button,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import PageContent from '../../../common/PageContent/PageContent';
import AccessContext from '../../../../contexts/AccessContext';
import { ADMIN } from '../../../providers/AccessProvider/permissions';
import { AutoCreateForm } from '../AutoCreateForm/AutoCreateForm';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import useAuthSettingsApi from '../../../../hooks/api/actions/useAuthSettingsApi/useAuthSettingsApi';
import useAuthSettings from '../../../../hooks/api/getters/useAuthSettings/useAuthSettings';
import useToast from '../../../../hooks/useToast';
import { formatUnknownError } from '../../../../utils/format-unknown-error';
import { removeEmptyStringFields } from '../../../../utils/remove-empty-string-fields';

const initialState = {
    enabled: false,
    enableSingleSignOut: false,
    autoCreate: false,
    unleashHostname: location.hostname,
    clientId: '',
    discoverUrl: '',
    secret: '',
    acrValues: '',
};

export const OidcAuth = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const [data, setData] = useState(initialState);
    const { hasAccess } = useContext(AccessContext);
    const { config } = useAuthSettings('oidc');
    const { updateSettings, errors, loading } = useAuthSettingsApi('oidc');

    useEffect(() => {
        if (config.discoverUrl) {
            setData(config);
        }
    }, [config]);

    if (!hasAccess(ADMIN)) {
        return (
            <Alert severity="error">
                You need to be a root admin to access this section.
            </Alert>
        );
    }

    const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.name, event.target.value);
    };

    const updateEnabled = () => {
        setData({ ...data, enabled: !data.enabled });
    };

    const updateSingleSignOut = () => {
        setData({ ...data, enableSingleSignOut: !data.enableSingleSignOut });
    };

    const setValue = (name: string, value: string | boolean) => {
        setData({
            ...data,
            [name]: value,
        });
    };

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        try {
            await updateSettings(removeEmptyStringFields(data));
            setToastData({
                title: 'Settings stored',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <PageContent headerContent="">
            <Grid container style={{ marginBottom: '1rem' }}>
                <Grid item md={12}>
                    <Alert severity="info">
                        Please read the{' '}
                        <a
                            href="https://www.unleash-hosted.com/docs/enterprise-authentication"
                            target="_blank"
                            rel="noreferrer"
                        >
                            documentation
                        </a>{' '}
                        to learn how to integrate with specific Open Id Connect
                        providers (Okta, Keycloak, Google, etc). <br />
                        Callback URL:{' '}
                        <code>{uiConfig.unleashUrl}/auth/oidc/callback</code>
                    </Alert>
                </Grid>
            </Grid>
            <form onSubmit={onSubmit}>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Enable</strong>
                        <p>Enable Open Id Connect Authentication.</p>
                    </Grid>
                    <Grid item md={6} style={{ padding: '20px' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    onChange={updateEnabled}
                                    value={data.enabled}
                                    name="enabled"
                                    checked={data.enabled}
                                />
                            }
                            label={data.enabled ? 'Enabled' : 'Disabled'}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Discover URL</strong>
                        <p>(Required) Issuer discover metadata URL</p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Discover URL"
                            name="discoverUrl"
                            value={data.discoverUrl}
                            disabled={!data.enabled}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Client ID</strong>
                        <p>(Required) Client ID of your OpenID application</p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Client ID"
                            name="clientId"
                            value={data.clientId}
                            disabled={!data.enabled}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Client secret</strong>
                        <p>
                            (Required) Client secret of your OpenID application.{' '}
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Client Secret"
                            name="secret"
                            value={data.secret}
                            disabled={!data.enabled}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <h3>Optional Configuration</h3>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Enable Single Sign-Out</strong>
                        <p>
                            If you enable Single Sign-Out Unleash will redirect
                            the user to the IDP as part of the Sign-out process.
                        </p>
                    </Grid>
                    <Grid item md={6} style={{ padding: '20px' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    onChange={updateSingleSignOut}
                                    value={data.enableSingleSignOut}
                                    disabled={!data.enabled}
                                    name="enableSingleSignOut"
                                    checked={data.enableSingleSignOut}
                                />
                            }
                            label={
                                data.enableSingleSignOut
                                    ? 'Enabled'
                                    : 'Disabled'
                            }
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>ACR Values</strong>
                        <p>
                            Requested Authentication Context Class Reference
                            values. If multiple values are specified they should
                            be "space" separated. Will be sent as "acr_values"
                            as part of the authentication request. Unleash will
                            validate the acr value in the id token claims
                            against the list of acr values.
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="ACR Values"
                            name="acrValues"
                            value={data.acrValues}
                            disabled={!data.enabled}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>

                <AutoCreateForm data={data} setValue={setValue} />

                <Grid container spacing={3}>
                    <Grid item md={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}
                        >
                            Save
                        </Button>{' '}
                        <p>
                            <small style={{ color: 'red' }}>
                                {errors?.message}
                            </small>
                        </p>
                    </Grid>
                </Grid>
            </form>
        </PageContent>
    );
};
