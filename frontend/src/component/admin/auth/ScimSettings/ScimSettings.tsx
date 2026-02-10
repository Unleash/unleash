import { Button, FormControlLabel, Grid, Switch, styled } from '@mui/material';
import { Alert } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ScimTokenGenerationDialog } from './ScimTokenGenerationDialog.tsx';
import { ScimTokenDialog } from './ScimTokenDialog.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { useScimSettingsApi } from 'hooks/api/actions/useScimSettingsApi/useScimSettingsApi';
import { useScimSettings } from 'hooks/api/getters/useScimSettings/useScimSettings';
import { ScimDeleteEntityDialog } from './ScimDeleteUsersDialog.tsx';
import useAdminUsersApi from 'hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import { useGroupApi } from 'hooks/api/actions/useGroupApi/useGroupApi';

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
    const [deleteGroupsDialog, setDeleteGroupsDialog] = useState(false);
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false);
    const [tokenDialog, setTokenDialog] = useState(false);
    const { settings, refetch } = useScimSettings();
    const { deleteScimUsers } = useAdminUsersApi();
    const { deleteScimGroups } = useGroupApi();
    const [enabled, setEnabled] = useState(settings.enabled ?? true);

    useEffect(() => {
        setEnabled(settings.enabled ?? false);
    }, [settings]);

    const { saveSettings, generateNewToken, loading } = useScimSettingsApi();

    const onGenerateNewToken = async () => {
        setTokenGenerationDialog(true);
    };

    const onDeleteScimGroups = async () => {
        try {
            await deleteScimGroups();
            setToastData({
                text: 'Scim Groups have been deleted',
                type: 'success',
            });
            setDeleteGroupsDialog(false);
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onDeleteScimUsers = async () => {
        try {
            await deleteScimUsers();
            setToastData({
                text: 'Scim Users have been deleted',
                type: 'success',
            });
            setDeleteUsersDialog(false);
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
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
            await saveSettings({ enabled });
            if (enabled && !settings.hasToken) {
                const token = await generateNewToken();
                setNewToken(token);
                setTokenDialog(true);
            }

            setToastData({
                text: 'Settings stored',
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
                            href='https://docs.getunleash.io/concepts/scim'
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

                <Grid container spacing={3}>
                    <Grid item md={10.5} mb={2}>
                        <StyledTitleDiv>
                            <strong>Delete SCIM Users</strong>
                        </StyledTitleDiv>
                        <p>
                            This will remove all SCIM users from the Unleash
                            database. This action cannot be undone through
                            Unleash but the upstream SCIM provider may re sync
                            these users.
                        </p>
                    </Grid>
                    <Grid item md={1.5}>
                        <Button
                            variant='outlined'
                            color='error'
                            disabled={loading}
                            onClick={() => {
                                setDeleteUsersDialog(true);
                            }}
                        >
                            Delete Users
                        </Button>
                    </Grid>
                    <Grid item md={10.5} mb={2}>
                        <StyledTitleDiv>
                            <strong>Delete SCIM Groups</strong>
                        </StyledTitleDiv>
                        <p>
                            This will remove all SCIM groups from the Unleash
                            database. This action cannot be undone through
                            Unleash but the upstream SCIM provider may re sync
                            these groups. Note that this may affect the
                            permissions of users present in those groups.
                        </p>
                    </Grid>
                    <Grid item md={1.5}>
                        <Button
                            variant='outlined'
                            color='error'
                            disabled={loading}
                            onClick={() => {
                                setDeleteGroupsDialog(true);
                            }}
                        >
                            Delete Groups
                        </Button>
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

                <ScimDeleteEntityDialog
                    open={deleteUsersDialog}
                    closeDialog={() => setDeleteUsersDialog(false)}
                    deleteEntities={onDeleteScimUsers}
                    entityType='Users'
                />

                <ScimDeleteEntityDialog
                    open={deleteGroupsDialog}
                    closeDialog={() => setDeleteGroupsDialog(false)}
                    deleteEntities={onDeleteScimGroups}
                    entityType='Groups'
                />
            </StyledContainer>
        </>
    );
};
