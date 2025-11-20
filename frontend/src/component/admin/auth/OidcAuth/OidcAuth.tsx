import type React from 'react';
import { useEffect, useState } from 'react';
import {
    Button,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
} from '@mui/material';
import { Alert } from '@mui/material';
import { AutoCreateForm } from '../AutoCreateForm/AutoCreateForm.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useAuthSettingsApi from 'hooks/api/actions/useAuthSettingsApi/useAuthSettingsApi';
import useAuthSettings from 'hooks/api/getters/useAuthSettings/useAuthSettings';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { removeEmptyStringFields } from 'utils/removeEmptyStringFields';
import { SsoGroupSettings } from '../SsoGroupSettings.tsx';
import type { IRole } from 'interfaces/role';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const initialState = {
    enabled: false,
    enableSingleSignOut: false,
    addGroupsScope: false,
    enableGroupSyncing: false,
    autoCreate: false,
    unleashHostname: location.hostname,
    groupJsonPath: '',
    clientId: '',
    discoverUrl: '',
    secret: '',
    acrValues: '',
    idTokenSigningAlgorithm: 'RS256',
    enablePkce: false,
};

type State = typeof initialState & {
    defaultRootRole?: string;
    defaultRootRoleId?: number;
};

export const OidcAuth = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const { oidcConfiguredThroughEnv } = uiConfig;
    const oidcPkceSupport = Boolean(uiConfig.flags?.oidcPkceSupport);
    const [data, setData] = useState<State>(initialState);
    const { config } = useAuthSettings('oidc');
    const { updateSettings, errors, loading } = useAuthSettingsApi('oidc');

    useEffect(() => {
        if (config.discoverUrl) {
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

    const updateSingleSignOut = () => {
        setData({ ...data, enableSingleSignOut: !data.enableSingleSignOut });
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
                        condition={Boolean(oidcConfiguredThroughEnv)}
                        show={
                            <Alert sx={{ mb: 2 }} severity='warning'>
                                OIDC is currently configured via environment
                                variables. Please refer to the{' '}
                                <a
                                    href='https://www.unleash-hosted.com/docs/enterprise-authentication'
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    documentation
                                </a>{' '}
                                for detailed instructions on how to set up OIDC
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
                        to learn how to integrate with specific OpenID Connect
                        providers (such as Okta and Keycloak). <br />
                        Callback URL:{' '}
                        <code>{uiConfig.unleashUrl}/auth/oidc/callback</code>
                    </Alert>
                </Grid>
            </Grid>
            <form onSubmit={onSubmit}>
                <Grid container spacing={3} mb={2}>
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
                                    name='enabled'
                                    checked={data.enabled}
                                />
                            }
                            label={data.enabled ? 'Enabled' : 'Disabled'}
                            disabled={oidcConfiguredThroughEnv}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Discover URL</strong>
                        <p>(Required) Issuer discover metadata URL</p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={trimAndUpdateField}
                            label='Discover URL'
                            name='discoverUrl'
                            value={data.discoverUrl}
                            disabled={!data.enabled || oidcConfiguredThroughEnv}
                            style={{ width: '400px' }}
                            variant='outlined'
                            size='small'
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Client ID</strong>
                        <p>(Required) Client ID of your OpenID application</p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={trimAndUpdateField}
                            label='Client ID'
                            name='clientId'
                            value={data.clientId}
                            disabled={!data.enabled || oidcConfiguredThroughEnv}
                            style={{ width: '400px' }}
                            variant='outlined'
                            size='small'
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={4}>
                    <Grid item md={5}>
                        <strong>Client secret</strong>
                        <p>
                            (Required) Client secret of your OpenID application.{' '}
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={trimAndUpdateField}
                            label='Client Secret'
                            name='secret'
                            value={data.secret}
                            disabled={!data.enabled || oidcConfiguredThroughEnv}
                            style={{ width: '400px' }}
                            variant='outlined'
                            size='small'
                            required
                        />
                    </Grid>
                </Grid>
                <h3>Optional Configuration</h3>
                <Grid container spacing={3} mb={2}>
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
                                    disabled={
                                        !data.enabled ||
                                        oidcConfiguredThroughEnv
                                    }
                                    name='enableSingleSignOut'
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
                <ConditionallyRender
                    condition={oidcPkceSupport}
                    show={
                        <Grid container spacing={3} mb={2}>
                            <Grid item md={5}>
                                <strong>Enable PKCE</strong>
                                <p>
                                    Require Proof Key for Code Exchange (PKCE)
                                    to add an extra layer of security for the
                                    authorization code flow.
                                </p>
                            </Grid>
                            <Grid item md={6} style={{ padding: '20px' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            onChange={(event) =>
                                                setValue(
                                                    'enablePkce',
                                                    event.target.checked,
                                                )
                                            }
                                            name='enablePkce'
                                            checked={Boolean(data.enablePkce)}
                                            disabled={
                                                !data.enabled ||
                                                oidcConfiguredThroughEnv
                                            }
                                        />
                                    }
                                    label={
                                        data.enablePkce ? 'Enabled' : 'Disabled'
                                    }
                                />
                            </Grid>
                        </Grid>
                    }
                />
                <Grid container spacing={3} mb={2}>
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
                            label='ACR Values'
                            name='acrValues'
                            value={data.acrValues}
                            disabled={!data.enabled || oidcConfiguredThroughEnv}
                            style={{ width: '400px' }}
                            variant='outlined'
                            size='small'
                        />
                    </Grid>
                </Grid>
                <SsoGroupSettings
                    ssoType='OIDC'
                    data={data}
                    setValue={setValue}
                    disabled={oidcConfiguredThroughEnv}
                />

                <AutoCreateForm
                    data={data}
                    setValue={setValue}
                    onUpdateRole={onUpdateRole}
                    disabled={oidcConfiguredThroughEnv}
                />
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>ID Signing algorithm</strong>
                        <p>
                            Which signing algorithm to use. <br /> Leave this
                            alone unless you see errors that look like
                            "unexpected JWT alg received, expected RS256, got:
                            RS512" in your logs.
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <FormControl style={{ minWidth: '200px' }}>
                            <InputLabel id='defaultRootRole-label'>
                                Signing algorithm
                            </InputLabel>
                            <Select
                                label='Signing algorithm'
                                labelId='idTokenSigningAlgorithm-label'
                                id='idTokenSigningAlgorithm'
                                name='idTokenSigningAlgorithm'
                                value={data.idTokenSigningAlgorithm || 'RS256'}
                                onChange={(e) =>
                                    setValue(
                                        'idTokenSigningAlgorithm',
                                        e.target.value,
                                    )
                                }
                                disabled={oidcConfiguredThroughEnv}
                            >
                                {/*consider these from API or constants. */}
                                <MenuItem value='RS256'>RS256</MenuItem>
                                <MenuItem value='RS384'>RS384</MenuItem>
                                <MenuItem value='RS512'>RS512</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid item md={12}>
                        <Button
                            variant='contained'
                            color='primary'
                            type='submit'
                            disabled={loading || oidcConfiguredThroughEnv}
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
