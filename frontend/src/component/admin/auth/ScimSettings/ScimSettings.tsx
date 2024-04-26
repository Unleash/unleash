import { Button, FormControlLabel, Grid, Switch } from '@mui/material';
import { Alert } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ScimTokenGenerationDialog } from './ScimTokenGenerationDialog';
import { ScimTokenDialog } from './ScimTokenDialog';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { ScimSettings } from 'hooks/api/getters/useScimSettings/useScimSettings';

export interface IScimSettingsParameters {
    disabled: boolean;
    loading: boolean;
    enabled: boolean;
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    assumeControlOfExisting: boolean;
    setAssumeControlOfExisting: React.Dispatch<React.SetStateAction<boolean>>;
    newToken: string;
    settings: ScimSettings;
    tokenGenerationDialog: boolean;
    setTokenGenerationDialog: React.Dispatch<React.SetStateAction<boolean>>;
    onGenerateNewTokenConfirm: () => void;
    tokenDialog: boolean;
    setTokenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ScimConfigSettings = ({
    disabled,
    loading,
    enabled,
    setEnabled,
    assumeControlOfExisting,
    setAssumeControlOfExisting,
    newToken,
    settings,
    tokenGenerationDialog,
    setTokenGenerationDialog,
    onGenerateNewTokenConfirm,
    tokenDialog,
    setTokenDialog,
}: IScimSettingsParameters) => {
    const { uiConfig } = useUiConfig();

    const onGenerateNewToken = async () => {
        setTokenGenerationDialog(true);
    };

    return (
        <>
            <h3>SCIM Provisioning</h3>
            <Grid container sx={{ mb: 3 }}>
                <Grid item md={12}>
                    <Alert severity='info'>
                        Please read the{' '}
                        <a
                            href='https://docs.getunleash.io/reference/scim'
                            target='_blank'
                            rel='noreferrer'
                        >
                            documentation
                        </a>{' '}
                        to learn how to integrate with specific SCIM clients
                        (Microsoft Entra, Okta, etc). <br />
                        SCIM API URL: <code>{uiConfig.unleashUrl}/scim</code>
                    </Alert>
                </Grid>
            </Grid>
            <Grid container spacing={3}>
                <Grid item md={5} mb={2}>
                    <strong>Enable</strong>
                    <p>Enable SCIM provisioning.</p>
                </Grid>
                <Grid item md={6}>
                    <FormControlLabel
                        control={
                            <Switch
                                onChange={(_, enabled) => setEnabled(enabled)}
                                value={enabled}
                                name='enabled'
                                checked={enabled}
                                disabled={disabled}
                            />
                        }
                        label={enabled ? 'Enabled' : 'Disabled'}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item md={5} mb={2}>
                    <strong>Assume control</strong>
                    <p>Assumes control of users and groups</p>
                </Grid>
                <Grid item md={6}>
                    <FormControlLabel
                        control={
                            <Switch
                                onChange={(_, set_enabled) =>
                                    setAssumeControlOfExisting(set_enabled)
                                }
                                value={assumeControlOfExisting}
                                name='assumeControlOfExisting'
                                checked={assumeControlOfExisting}
                                disabled={disabled}
                            />
                        }
                        label={assumeControlOfExisting ? 'Enabled' : 'Disabled'}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item md={5} mb={2}>
                    <ConditionallyRender
                        condition={Boolean(settings.hasToken)}
                        show={
                            <Button
                                variant='outlined'
                                color='error'
                                disabled={loading}
                                onClick={onGenerateNewToken}
                            >
                                Generate new token
                            </Button>
                        }
                    />
                </Grid>
            </Grid>
            <ScimTokenGenerationDialog
                open={tokenGenerationDialog}
                setOpen={setTokenGenerationDialog}
                onConfirm={onGenerateNewTokenConfirm}
            />
            <ScimTokenDialog
                open={tokenDialog}
                setOpen={setTokenDialog}
                token={newToken}
            />
        </>
    );
};
