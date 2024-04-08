import type React from 'react';
import { useEffect, useState } from 'react';
import { Button, FormControlLabel, Grid, Switch } from '@mui/material';
import { Alert } from '@mui/material';
import useToast from 'hooks/useToast';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useScimSettings } from 'hooks/api/getters/useScimSettings/useScimSettings';
import { useScimSettingsApi } from 'hooks/api/actions/useScimSettingsApi/useScimSettingsApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ScimTokenGenerationDialog } from './ScimTokenGenerationDialog';
import { ScimTokenDialog } from './ScimTokenDialog';

export const ScimSettings = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const { settings, refetch } = useScimSettings();
    const { saveSettings, generateNewToken, errors, loading } =
        useScimSettingsApi();

    const [enabled, setEnabled] = useState(false);

    const [tokenGenerationDialog, setTokenGenerationDialog] = useState(false);
    const [tokenDialog, setTokenDialog] = useState(false);
    const [newToken, setNewToken] = useState('');

    useEffect(() => {
        setEnabled(settings.enabled ?? false);
    }, [settings]);

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        try {
            await saveSettings({ enabled });
            if (enabled && !settings.hasToken) {
                const token = await generateNewToken();
                setNewToken(token);
                setTokenDialog(true);
            }

            setToastData({
                title: 'Settings stored',
                type: 'success',
            });
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onGenerateNewToken = async () => {
        setTokenGenerationDialog(true);
    };

    const onGenerateNewTokenConfirm = async () => {
        setTokenGenerationDialog(false);
        const token = await generateNewToken();
        setNewToken(token);
        setTokenDialog(true);
    };

    return (
        <>
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
            <form onSubmit={onSubmit}>
                <Grid container spacing={3}>
                    <Grid item md={5} mb={2}>
                        <strong>Enable</strong>
                        <p>Enable SCIM provisioning.</p>
                    </Grid>
                    <Grid item md={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    onChange={(_, enabled) =>
                                        setEnabled(enabled)
                                    }
                                    value={enabled}
                                    name='enabled'
                                    checked={enabled}
                                />
                            }
                            label={enabled ? 'Enabled' : 'Disabled'}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <Button
                            variant='contained'
                            color='primary'
                            type='submit'
                            disabled={loading}
                        >
                            Save
                        </Button>
                        <ConditionallyRender
                            condition={Boolean(settings.hasToken)}
                            show={
                                <Button
                                    variant='outlined'
                                    color='error'
                                    disabled={loading}
                                    onClick={onGenerateNewToken}
                                    sx={{ ml: 1 }}
                                >
                                    Generate new token
                                </Button>
                            }
                        />
                    </Grid>
                </Grid>
            </form>
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
