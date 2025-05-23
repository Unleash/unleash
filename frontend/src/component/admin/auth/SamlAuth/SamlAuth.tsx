import type React from 'react';
import { useEffect, useState } from 'react';
import {
    Button,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
} from '@mui/material';
import { Alert } from '@mui/material';
import { AutoCreateForm } from '../AutoCreateForm/AutoCreateForm.tsx';
import useToast from 'hooks/useToast';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useAuthSettings from 'hooks/api/getters/useAuthSettings/useAuthSettings';
import useAuthSettingsApi from 'hooks/api/actions/useAuthSettingsApi/useAuthSettingsApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { removeEmptyStringFields } from 'utils/removeEmptyStringFields';
import { SsoGroupSettings } from '../SsoGroupSettings.tsx';
import type { IRole } from 'interfaces/role';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const initialState = {
    enabled: false,
    autoCreate: false,
    enableGroupSyncing: false,
    addGroupsScope: false,
    unleashHostname: location.hostname,
    entityId: '',
    signOnUrl: '',
    certificate: '',
    signOutUrl: '',
    spCertificate: '',
    groupJsonPath: '',
};

type State = typeof initialState & {
    defaultRootRole?: string;
    defaultRootRoleId?: number;
};

export const SamlAuth = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const { samlConfiguredThroughEnv } = uiConfig;
    const [data, setData] = useState<State>(initialState);
    const { config } = useAuthSettings('saml');
    const { updateSettings, errors, loading } = useAuthSettingsApi('saml');

    useEffect(() => {
        if (config.entityId) {
            setData(config);
        }
    }, [config]);

    const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.name, event.target.value);
    };

    const trimAndUpdateField = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.name, event.target.value.trim());
    };

    const updateEnabled = () => {
        setData({ ...data, enabled: !data.enabled });
    };

    const setValue = (
        name: string,
        value: string | boolean | number | undefined,
    ) => {
        setData({
            ...data,
            [name]: value,
        });
    };

    const onUpdateRole = (role: IRole | null) => {
        setData({
            ...data,
            defaultRootRole: undefined,
            defaultRootRoleId: role?.id,
        });
    };

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        try {
            await updateSettings(removeEmptyStringFields(data));
            setToastData({
                text: 'Settings stored',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <Grid container sx={{ mb: 3 }}>
                <Grid item md={12}>
                    <ConditionallyRender
                        condition={Boolean(samlConfiguredThroughEnv)}
                        show={
                            <Alert sx={{ mb: 2 }} severity='warning'>
                                SAML is currently configured via environment
                                variables. Please refer to the{' '}
                                <a
                                    href='https://www.unleash-hosted.com/docs/enterprise-authentication'
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    documentation
                                </a>{' '}
                                for detailed instructions on how to set up SAML
                                using these variables.
                            </Alert>
                        }
                    />
                    <Alert severity='info'>
                        Please read the{' '}
                        <a
                            href='https://www.unleash-hosted.com/docs/enterprise-authentication'
                            target='_blank'
                            rel='noreferrer'
                        >
                            documentation
                        </a>{' '}
                        to learn how to integrate with specific SAML 2.0
                        providers (such as Okta, Keycloak, and Microsoft Entra
                        ID). <br />
                        Callback URL:{' '}
                        <code>{uiConfig.unleashUrl}/auth/saml/callback</code>
                    </Alert>
                </Grid>
            </Grid>
            <form onSubmit={onSubmit}>
                <Grid container spacing={3}>
                    <Grid item md={5} mb={2}>
                        <strong>Enable</strong>
                        <p>Enable SAML 2.0 Authentication.</p>
                    </Grid>
                    <Grid item md={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    onChange={updateEnabled}
                                    value={data.enabled}
                                    name='enabled'
                                    checked={data.enabled}
                                    disabled={samlConfiguredThroughEnv}
                                />
                            }
                            label={data.enabled ? 'Enabled' : 'Disabled'}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Entity ID</strong>
                        <p>(Required) The Entity Identity provider issuer.</p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={trimAndUpdateField}
                            label='Entity ID'
                            name='entityId'
                            value={data.entityId}
                            disabled={!data.enabled || samlConfiguredThroughEnv}
                            style={{ width: '400px' }}
                            variant='outlined'
                            size='small'
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Single Sign-On URL</strong>
                        <p>
                            (Required) The url to redirect the user to for
                            signing in.
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={trimAndUpdateField}
                            label='Single Sign-On URL'
                            name='signOnUrl'
                            value={data.signOnUrl}
                            disabled={!data.enabled || samlConfiguredThroughEnv}
                            style={{ width: '400px' }}
                            variant='outlined'
                            size='small'
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={4}>
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
                            label='X.509 Certificate'
                            name='certificate'
                            value={data.certificate}
                            disabled={!data.enabled || samlConfiguredThroughEnv}
                            style={{ width: '100%' }}
                            InputProps={{
                                style: {
                                    fontSize: '0.6em',
                                    fontFamily: 'monospace',
                                },
                            }}
                            multiline
                            rows={14}
                            maxRows={14}
                            variant='outlined'
                            size='small'
                            required
                        />
                    </Grid>
                </Grid>
                <h3>Optional Configuration</h3>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Single Sign-out URL</strong>
                        <p>
                            (Optional) The url to redirect the user to for
                            signing out of the IDP.
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={trimAndUpdateField}
                            label='Single Sign-out URL'
                            name='signOutUrl'
                            value={data.signOutUrl}
                            disabled={!data.enabled || samlConfiguredThroughEnv}
                            style={{ width: '400px' }}
                            variant='outlined'
                            size='small'
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Service Provider X.509 Certificate</strong>
                        <p>
                            (Optional) The private certificate used by the
                            Service Provider used to sign the SAML 2.0 request
                            towards the IDP. E.g. used to sign single logout
                            requests (SLO).
                        </p>
                    </Grid>
                    <Grid item md={7}>
                        <TextField
                            onChange={updateField}
                            label='X.509 Certificate'
                            name='spCertificate'
                            value={data.spCertificate}
                            disabled={!data.enabled || samlConfiguredThroughEnv}
                            style={{ width: '100%' }}
                            InputProps={{
                                style: {
                                    fontSize: '0.6em',
                                    fontFamily: 'monospace',
                                },
                            }}
                            multiline
                            rows={14}
                            maxRows={14}
                            variant='outlined'
                            size='small'
                        />
                    </Grid>
                </Grid>

                <SsoGroupSettings
                    ssoType='SAML'
                    data={data}
                    setValue={setValue}
                    disabled={samlConfiguredThroughEnv}
                />

                <AutoCreateForm
                    data={data}
                    setValue={setValue}
                    onUpdateRole={onUpdateRole}
                    disabled={samlConfiguredThroughEnv}
                />
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <Button
                            variant='contained'
                            color='primary'
                            type='submit'
                            disabled={loading || samlConfiguredThroughEnv}
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
        </>
    );
};
