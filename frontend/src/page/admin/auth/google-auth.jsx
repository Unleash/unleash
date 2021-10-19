import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import PageContent from '../../../component/common/PageContent/PageContent';
import AccessContext from '../../../contexts/AccessContext';
import { ADMIN } from '../../../component/providers/AccessProvider/permissions';

const initialState = {
    enabled: false,
    autoCreate: false,
    unleashHostname: location.hostname,
};

function GoogleAuth({
    config,
    getGoogleConfig,
    updateGoogleConfig,
    unleashUrl,
}) {
    const [data, setData] = useState(initialState);
    const [info, setInfo] = useState();
    const { hasAccess } = useContext(AccessContext);

    useEffect(() => {
        getGoogleConfig();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (config.clientId) {
            setData(config);
        }
    }, [config]);

    if (!hasAccess(ADMIN)) {
        return <span>You need admin privileges to access this section.</span>;
    }

    const updateField = e => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const updateEnabled = () => {
        setData({ ...data, enabled: !data.enabled });
    };

    const updateAutoCreate = () => {
        setData({ ...data, autoCreate: !data.autoCreate });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setInfo('...saving');
        try {
            await updateGoogleConfig(data);
            setInfo('Settings stored');
            setTimeout(() => setInfo(''), 2000);
        } catch (e) {
            setInfo(e.message);
        }
    };
    return (
        <PageContent>
            <Grid container style={{ marginBottom: '1rem' }}>
                <Grid item xs={12}>
                    <Alert severity="info">
                        Please read the{' '}
                        <a
                            href="https://www.unleash-hosted.com/docs/enterprise-authentication/google"
                            target="_blank"
                            rel="noreferrer"
                        >
                            documentation
                        </a>{' '}
                        to learn how to integrate with Google OAuth 2.0. <br />
                        Callback URL:{' '}
                        <code>{unleashUrl}/auth/google/callback</code>
                    </Alert>
                </Grid>
            </Grid>
            <form onSubmit={onSubmit}>
                <Grid container spacing={3}>
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
                <Grid container spacing={3}>
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
                            value={data.clientId || ''}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
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
                            value={data.clientSecret || ''}
                            placeholder=""
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
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
                <Grid container spacing={3}>
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
                        >
                            Auto-create users
                        </Switch>
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
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
                        >
                            Save
                        </Button>{' '}
                        <small>{info}</small>
                    </Grid>
                </Grid>
            </form>
        </PageContent>
    );
}

GoogleAuth.propTypes = {
    config: PropTypes.object,
    unleashUrl: PropTypes.string,
    getGoogleConfig: PropTypes.func.isRequired,
    updateGoogleConfig: PropTypes.func.isRequired,
};

export default GoogleAuth;
