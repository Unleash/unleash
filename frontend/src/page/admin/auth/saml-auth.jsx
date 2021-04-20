import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, Switch, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import PageContent from '../../../component/common/PageContent/PageContent';
import AccessContext from '../../../contexts/AccessContext';
import { ADMIN } from '../../../component/AccessProvider/permissions';

const initialState = {
    enabled: false,
    autoCreate: false,
    unleashHostname: location.hostname,
};

function SamlAuth({ config, getSamlConfig, updateSamlConfig, unleashUrl }) {
    const [data, setData] = useState(initialState);
    const [info, setInfo] = useState();
    const { hasAccess } = useContext(AccessContext);

    useEffect(() => {
        getSamlConfig();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (config.entityId) {
            setData(config);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config]);

    if (!hasAccess(ADMIN)) {
        return <Alert severity="error">You need to be a root admin to access this section.</Alert>;
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
            await updateSamlConfig(data);
            setInfo('Settings stored');
            setTimeout(() => setInfo(''), 2000);
        } catch (e) {
            setInfo(e.message);
        }
    };
    return (
        <PageContent>
            <Grid container style={{ marginBottom: '1rem' }}>
                <Grid item md={12}>
                    <Alert severity="info">
                        Please read the{' '}
                        <a href="https://www.unleash-hosted.com/docs/enterprise-authentication" target="_blank" rel="noreferrer">
                            documentation
                        </a>{' '}
                        to learn how to integrate with specific SAML 2.0 providers (Okta, Keycloak, etc). <br />
                        Callback URL: <code>{unleashUrl}/auth/saml/callback</code>
                    </Alert>
                </Grid>
            </Grid>
            <form onSubmit={onSubmit}>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Enable</strong>
                        <p>Enable SAML 2.0 Authentication.</p>
                    </Grid>
                    <Grid item md={6}>
                        <Switch onChange={updateEnabled} value={data.enabled} name="enabled" checked={data.enabled}>
                            {data.enabled ? 'Enabled' : 'Disabled'}
                        </Switch>
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Entity ID</strong>
                        <p>(Required) The Entity Identity provider issuer.</p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Entity ID"
                            name="entityId"
                            value={data.entityId || ''}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Single Sign-On URL</strong>
                        <p>(Required) The url to redirect the user to for signing in.</p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Single Sign-On URL"
                            name="signOnUrl"
                            value={data.signOnUrl || ''}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>X.509 Certificate</strong>
                        <p>(Required) The certificate used to sign the SAML 2.0 request.</p>
                    </Grid>
                    <Grid item md={7}>
                        <TextField
                            onChange={updateField}
                            label="X.509 Certificate"
                            name="certificate"
                            value={data.certificate || ''}
                            style={{
                                width: '100%',
                                fontSize: '0.7em',
                                fontFamily: 'monospace',
                            }}
                            multiline
                            rows={14}
                            rowsMax={14}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Auto-create users</strong>
                        <p>Enable automatic creation of new users when signing in with Saml.</p>
                    </Grid>
                    <Grid item md={6} style={{ padding: '20px' }}>
                        <Switch onChange={updateAutoCreate} name="enabled" checked={data.autoCreate}>
                            Auto-create users
                        </Switch>
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Email domains</strong>
                        <p>(Optional) Comma separated list of email domains that should be allowed to sign in.</p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Email domains"
                            name="emailDomains"
                            value={data.emailDomains || ''}
                            placeholder="@company.com, @anotherCompany.com"
                            style={{ width: '400px' }}
                            rows={2}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <Button variant="contained" color="primary" type="submit">
                            Save
                        </Button>{' '}
                        <small>{info}</small>
                    </Grid>
                </Grid>
            </form>
        </PageContent>
    );
}

SamlAuth.propTypes = {
    config: PropTypes.object,
    unleash: PropTypes.string,
    getSamlConfig: PropTypes.func.isRequired,
    updateSamlConfig: PropTypes.func.isRequired,
};

export default SamlAuth;
