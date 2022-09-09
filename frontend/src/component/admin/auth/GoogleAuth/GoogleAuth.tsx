import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
} from '@mui/material';
import { Alert } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import AccessContext from 'contexts/AccessContext';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useAuthSettings from 'hooks/api/getters/useAuthSettings/useAuthSettings';
import useAuthSettingsApi from 'hooks/api/actions/useAuthSettingsApi/useAuthSettingsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { removeEmptyStringFields } from 'utils/removeEmptyStringFields';

const initialState = {
    enabled: false,
    autoCreate: false,
    unleashHostname: location.hostname,
    clientId: '',
    clientSecret: '',
    emailDomains: '',
};

export const GoogleAuth = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const [data, setData] = useState(initialState);
    const { hasAccess } = useContext(AccessContext);
    const { config } = useAuthSettings('google');
    const { updateSettings, errors, loading } = useAuthSettingsApi('google');

    useEffect(() => {
        if (config.clientId) {
            setData(config);
        }
    }, [config]);

    if (!hasAccess(ADMIN)) {
        return <span>You need admin privileges to access this section.</span>;
    }

    const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData({
            ...data,
            [event.target.name]: event.target.value,
        });
    };

    const updateEnabled = () => {
        setData({ ...data, enabled: !data.enabled });
    };

    const updateAutoCreate = () => {
        setData({ ...data, autoCreate: !data.autoCreate });
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
        <PageContent>
            <Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                    This integration is deprecated and will be removed in next
                    major version. Please use <strong>OpenID Connect</strong> to
                    enable Google SSO.
                </Alert>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Read the{' '}
                    <a
                        href="https://www.unleash-hosted.com/docs/enterprise-authentication/google"
                        target="_blank"
                        rel="noreferrer"
                    >
                        documentation
                    </a>{' '}
                    to learn how to integrate with Google OAuth 2.0. <br />
                    Callback URL:{' '}
                    <code>{uiConfig.unleashUrl}/auth/google/callback</code>
                </Alert>
            </Box>
            <form onSubmit={onSubmit}>
                <Grid container spacing={3} mb={2}>
                    <Grid item xs={5}>
                        <strong>Enable</strong>
                        <p>
                            Enable Google users to login. Value is ignored if
                            Client ID and Client Secret are not defined.
                        </p>
                    </Grid>
                    <Grid item xs={6} style={{ padding: '20px' }}>
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
                <Grid container spacing={3} mb={2}>
                    <Grid item xs={5}>
                        <strong>Client ID</strong>
                        <p>
                            (Required) The Client ID provided by Google when
                            registering the application.
                        </p>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            onChange={updateField}
                            label="Client ID"
                            name="clientId"
                            placeholder=""
                            value={data.clientId}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Client Secret</strong>
                        <p>
                            (Required) Client Secret provided by Google when
                            registering the application.
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Client Secret"
                            name="clientSecret"
                            value={data.clientSecret}
                            placeholder=""
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Unleash hostname</strong>
                        <p>
                            (Required) The hostname you are running Unleash on
                            that Google should send the user back to. The final
                            callback URL will be{' '}
                            <small>
                                <code>
                                    https://[unleash.hostname.com]/auth/google/callback
                                </code>
                            </small>
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Unleash Hostname"
                            name="unleashHostname"
                            placeholder=""
                            value={data.unleashHostname || ''}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Auto-create users</strong>
                        <p>
                            Enable automatic creation of new users when signing
                            in with Google.
                        </p>
                    </Grid>
                    <Grid item md={6} style={{ padding: '20px' }}>
                        <Switch
                            onChange={updateAutoCreate}
                            name="enabled"
                            checked={data.autoCreate}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Email domains</strong>
                        <p>
                            (Optional) Comma separated list of email domains
                            that should be allowed to sign in.
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Email domains"
                            name="emailDomains"
                            value={data.emailDomains}
                            placeholder="@company.com, @anotherCompany.com"
                            style={{ width: '400px' }}
                            rows={2}
                            multiline
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
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
