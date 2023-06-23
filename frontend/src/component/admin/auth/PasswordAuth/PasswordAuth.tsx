import React, { useEffect, useState } from 'react';
import { Button, FormControlLabel, Grid, Switch } from '@mui/material';
import { Alert } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import useAuthSettings from 'hooks/api/getters/useAuthSettings/useAuthSettings';
import useAuthSettingsApi, {
    ISimpleAuthSettings,
} from 'hooks/api/actions/useAuthSettingsApi/useAuthSettingsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useAdminCount } from 'hooks/api/getters/useAdminCount/useAdminCount';
import { Link } from 'react-router-dom';
import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { PasswordAuthDialog } from './PasswordAuthDialog';

export const PasswordAuth = () => {
    const { setToastData, setToastApiError } = useToast();
    const { config, refetch } = useAuthSettings('simple');
    const [disablePasswordAuth, setDisablePasswordAuth] =
        useState<boolean>(false);
    const { updateSettings, errors, loading } =
        useAuthSettingsApi<ISimpleAuthSettings>('simple');
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const { data: adminCount } = useAdminCount();
    const { tokens } = useApiTokens();

    useEffect(() => {
        setDisablePasswordAuth(!!config.disabled);
    }, [config.disabled]);

    const updateDisabled = () => {
        setDisablePasswordAuth(!disablePasswordAuth);
    };

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        if (!config.disabled && disablePasswordAuth) {
            setConfirmationOpen(true);
        } else {
            onConfirm();
        }
    };

    const onConfirm = async () => {
        try {
            const settings: ISimpleAuthSettings = {
                disabled: disablePasswordAuth,
            };
            await updateSettings(settings);
            refetch();
            setToastData({
                title: 'Successfully saved',
                text: 'Password authentication settings stored.',
                autoHideDuration: 4000,
                type: 'success',
                show: true,
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
            setDisablePasswordAuth(config.disabled);
        }
    };

    return (
        <PageContent>
            <form onSubmit={onSubmit}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Overview of administrators on your Unleash instance:
                    <br />
                    <br />
                    <strong>Password based administrators: </strong>{' '}
                    <Link to="/admin/users">{adminCount?.password}</Link>
                    <br />
                    <strong>Other administrators: </strong>{' '}
                    <Link to="/admin/users">{adminCount?.noPassword}</Link>
                    <br />
                    <strong>Admin service accounts: </strong>{' '}
                    <Link to="/admin/service-accounts">
                        {adminCount?.service}
                    </Link>
                    <br />
                    <strong>Admin API tokens: </strong>{' '}
                    <Link to="/admin/api">
                        {tokens.filter(({ type }) => type === 'admin').length}
                    </Link>
                </Alert>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Password based login</strong>
                        <p>Allow users to login with username & password</p>
                    </Grid>
                    <Grid item md={6} style={{ padding: '20px' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    onChange={updateDisabled}
                                    value={!disablePasswordAuth}
                                    name="disabled"
                                    checked={!disablePasswordAuth}
                                />
                            }
                            label={
                                !disablePasswordAuth ? 'Enabled' : 'Disabled'
                            }
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={12}>
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
                <PasswordAuthDialog
                    open={confirmationOpen}
                    setOpen={setConfirmationOpen}
                    onClick={() => {
                        setConfirmationOpen(false);
                        onConfirm();
                    }}
                    adminCount={adminCount!}
                    tokens={tokens}
                />
            </form>
        </PageContent>
    );
};
