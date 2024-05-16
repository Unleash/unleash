import { Button, FormControlLabel, Grid, Switch, styled } from '@mui/material';
import { Alert } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ScimTokenGenerationDialog } from './ScimTokenGenerationDialog';
import { ScimTokenDialog } from './ScimTokenDialog';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { useScimSettingsApi } from 'hooks/api/actions/useScimSettingsApi/useScimSettingsApi';
import { useScimSettings } from 'hooks/api/getters/useScimSettings/useScimSettings';

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledTitleDiv = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

export const ScimSettings = () => {
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const [newToken, setNewToken] = useState('');
    const [tokenGenerationDialog, setTokenGenerationDialog] = useState(false);
    const [tokenDialog, setTokenDialog] = useState(false);
    const { settings, refetch } = useScimSettings();
    const [enabled, setEnabled] = useState(settings.enabled ?? true);

    useEffect(() => {
        setEnabled(settings.enabled ?? false);
    }, [settings]);

    const { saveSettings, generateNewToken, errors, loading } =
        useScimSettingsApi();

    const onGenerateNewToken = async () => {
        setTokenGenerationDialog(true);
    };

    const onGenerateNewTokenConfirm = async () => {
        setTokenGenerationDialog(false);
        const token = await generateNewToken();
        setNewToken(token);
        setTokenDialog(true);
    };

    const saveScimSettings = async (enabled: boolean) => {
        try {
            setEnabled(enabled);
            await saveSettings({ enabled, assumeControlOfExisting: false });
            if (enabled && !settings.hasToken) {
                const token = await generateNewToken();
                setNewToken(token);
                setTokenDialog(true);
            }

            setToastData({
                title: 'Settings stored',
                type: 'success',
            });
            await refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
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
            <StyledContainer>
                <Grid container spacing={3}>
                    <Grid item md={10.5} mb={2}>
                        <StyledTitleDiv>
                            <strong>SCIM provisioning</strong>
                        </StyledTitleDiv>
                        <p>
                            Enables SCIM provisioning. If SCIM provisioning has
                            not previously been enabled here this will also set
                            up a new auth token to use with your SCIM client,
                            and display it to the user. After the dialog has
                            been closed, this token will not be displayed again.
                            If you need a new token you can click the Generate
                            new token button below which will replace the old
                            token with a new token, and similarly display the
                            new token one time to the user.
                        </p>
                    </Grid>
                    <Grid item md={1.5}>
                        <FormControlLabel
                            control={
                                <Switch
                                    onChange={(_, enabled) => {
                                        saveScimSettings(enabled);
                                    }}
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
            </StyledContainer>
        </>
    );
};
