import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, FormControlLabel, Grid, Switch, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import PageContent from '../../../component/common/PageContent/PageContent';
import AccessContext from '../../../contexts/AccessContext';
import { ADMIN } from '../../../component/AccessProvider/permissions';
import AutoCreateForm from './AutoCreateForm/AutoCreateForm';

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
        return (
            <Alert severity="error">
                You need to be a root admin to access this section.
            </Alert>
        );
    }

    const updateField = e => {
        setValue(e.target.name, e.target.value);
    };

    const updateEnabled = () => {
        setData({ ...data, enabled: !data.enabled });
    };

    const setValue = (field, value) => {
        setData({
            ...data,
            [field]: value,
        });
    }

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
                        <a
                            href="https://www.unleash-hosted.com/docs/enterprise-authentication"
                            target="_blank"
                            rel="noreferrer"
                        >
                            documentation
                        </a>{' '}
                        to learn how to integrate with specific SAML 2.0
                        providers (Okta, Keycloak, etc). <br />
                        Callback URL:{' '}
                        <code>{unleashUrl}/auth/saml/callback</code>
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
                        <FormControlLabel
                            control={ <Switch
                                onChange={updateEnabled}
                                value={data.enabled}
                                name="enabled"
                                checked={data.enabled}
                            />}
                            label={data.enabled ? 'Enabled' : 'Disabled'}
                        />
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
                        <strong>Single Sign-On URL</strong>
                        <p>
                            (Required) The url to redirect the user to for
                            signing in.
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Single Sign-On URL"
                            name="signOnUrl"
                            value={data.signOnUrl || ''}
                            disabled={!data.enabled}
                            style={{ width: '400px'}}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>X.509 Certificate</strong>
                        <p>
                            (Required) The certificate used to sign the SAML 2.0
                            request.
                        </p>
                    </Grid>
                    <Grid item md={7}>
                        <TextField
                            onChange={updateField}
                            label="X.509 Certificate"
                            name="certificate"
                            value={data.certificate || ''}
                            disabled={!data.enabled}
                            style={{width: '100%'}}
                            InputProps={{
                                style: {
                                    fontSize: '0.6em',
                                    fontFamily: 'monospace',
                            }}}
                            multiline
                            rows={14}
                            rowsMax={14}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <h3>Optional Configuration</h3>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Single Sign-out URL</strong>
                        <p>
                            (Optional) The url to redirect the user to for
                            signing out of the IDP.
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Single Sign-out URL"
                            name="signOutUrl"
                            value={data.signOutUrl || ''}
                            disabled={!data.enabled}
                            style={{ width: '400px'}}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <strong>Service Provider X.509 Certificate</strong>
                        <p>
                            (Optional) The private certificate used by the Service Provider used to sign the SAML 2.0
                            request towards the IDP. E.g. used to sign single logout requests (SLO).
                        </p>
                    </Grid>
                    <Grid item md={7}>
                        <TextField
                            onChange={updateField}
                            label="X.509 Certificate"
                            name="spCertificate"
                            value={data.spCertificate || ''}
                            disabled={!data.enabled}
                            style={{width: '100%'}}
                            InputProps={{
                                style: {
                                    fontSize: '0.6em',
                                    fontFamily: 'monospace',
                            }}}
                            multiline
                            rows={14}
                            rowsMax={14}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>
                <AutoCreateForm data={data} setValue={setValue} />
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

SamlAuth.propTypes = {
    config: PropTypes.object,
    unleash: PropTypes.string,
    getSamlConfig: PropTypes.func.isRequired,
    updateSamlConfig: PropTypes.func.isRequired,
};

export default SamlAuth;
