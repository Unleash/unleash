import React, { useContext, useEffect, useState } from 'react';
import { Button, FormControlLabel, Grid, Switch } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import PageContent from '../../../common/PageContent/PageContent';
import AccessContext from '../../../../contexts/AccessContext';
import { ADMIN } from '../../../providers/AccessProvider/permissions';
import useAuthSettings from '../../../../hooks/api/getters/useAuthSettings/useAuthSettings';
import useAuthSettingsApi, {
    ISimpleAuthSettings,
} from '../../../../hooks/api/actions/useAuthSettingsApi/useAuthSettingsApi';
import useToast from '../../../../hooks/useToast';
import { formatUnknownError } from '../../../../utils/format-unknown-error';

export const PasswordAuth = () => {
    const { setToastData, setToastApiError } = useToast();
    const { config } = useAuthSettings('simple');
    const [disablePasswordAuth, setDisablePasswordAuth] =
        useState<boolean>(false);
    const { updateSettings, errors, loading } =
        useAuthSettingsApi<ISimpleAuthSettings>('simple');
    const { hasAccess } = useContext(AccessContext);

    useEffect(() => {
        setDisablePasswordAuth(!!config.disabled);
    }, [config.disabled]);

    if (!hasAccess(ADMIN)) {
        return (
            <Alert severity="error">
                You need to be a root admin to access this section.
            </Alert>
        );
    }

    const updateDisabled = () => {
        setDisablePasswordAuth(!disablePasswordAuth);
    };

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        try {
            const settings: ISimpleAuthSettings = {
                disabled: disablePasswordAuth,
            };
            await updateSettings(settings);
            setToastData({
                title: 'Successfully saved',
                text: 'Password authentication settings stored.',
                autoHideDuration: 4000,
                type: 'success',
                show: true,
            });
        } catch (err) {
            setToastApiError(formatUnknownError(err));
            setDisablePasswordAuth(config.disabled);
        }
    };
    return (
        <PageContent headerContent="">
            <form onSubmit={onSubmit}>
                <Grid container spacing={3}>
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
            </form>
        </PageContent>
    );
};
