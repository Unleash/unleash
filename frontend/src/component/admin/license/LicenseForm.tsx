import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box, Button, Grid, TextField, styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import {
    useLicense,
    useLicenseCheck,
} from 'hooks/api/getters/useLicense/useLicense';
import { formatDateYMD } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useState } from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import useLicenseKeyApi from 'hooks/api/actions/useLicenseAPI/useLicenseApi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(4),
}));

const StyledDataCollectionPropertyRow = styled('div')(() => ({
    display: 'table-row',
}));

const StyledPropertyName = styled('p')(({ theme }) => ({
    display: 'table-cell',
    fontWeight: theme.fontWeight.bold,
    paddingTop: theme.spacing(2),
}));

const StyledPropertyDetails = styled('p')(({ theme }) => ({
    display: 'table-cell',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(4),
}));

export const LicenseForm = () => {
    const { setToastData, setToastApiError } = useToast();
    const { license, error, refetchLicense } = useLicense();
    const { reCheckLicense } = useLicenseCheck();
    const { loading } = useUiConfig();
    const { locationSettings } = useLocationSettings();
    const [token, setToken] = useState('');
    const { updateLicenseKey } = useLicenseKeyApi();

    const updateToken = (event: React.ChangeEvent<HTMLInputElement>) => {
        setToken(event.target.value.trim());
    };

    if (loading || !license) {
        return null;
    }

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        try {
            await updateLicenseKey(token);
            setToastData({
                text: 'License key updated',
                type: 'success',
            });
            refetchLicense();
            reCheckLicense();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const resources = {
        Seats: license.resources.seats,
        'Release templates': license.resources.releaseTemplates,
        'Edge instances': license.resources.edgeInstances,
    };

    return (
        <PageContent header={<PageHeader title='Unleash Enterprise License' />}>
            <StyledBox>
                <ConditionallyRender
                    condition={!!license.token}
                    show={
                        <div>
                            <StyledDataCollectionPropertyRow>
                                <StyledPropertyName>
                                    Customer
                                </StyledPropertyName>
                                <StyledPropertyDetails>
                                    {license.customer}
                                </StyledPropertyDetails>
                            </StyledDataCollectionPropertyRow>
                            <StyledDataCollectionPropertyRow>
                                <StyledPropertyName>
                                    Instance Name
                                </StyledPropertyName>
                                <StyledPropertyDetails>
                                    {license.instanceName}
                                </StyledPropertyDetails>
                            </StyledDataCollectionPropertyRow>
                            <StyledDataCollectionPropertyRow>
                                <StyledPropertyName>Plan</StyledPropertyName>
                                <StyledPropertyDetails>
                                    {license.plan}
                                </StyledPropertyDetails>
                            </StyledDataCollectionPropertyRow>
                            {Object.entries(resources).map(
                                ([resourceName, resourceValue]) =>
                                    resourceValue && (
                                        <StyledDataCollectionPropertyRow
                                            key={resourceName}
                                        >
                                            <StyledPropertyName>
                                                {resourceName}
                                            </StyledPropertyName>
                                            <StyledPropertyDetails>
                                                {resourceValue}
                                            </StyledPropertyDetails>
                                        </StyledDataCollectionPropertyRow>
                                    ),
                            )}
                            <StyledDataCollectionPropertyRow>
                                <StyledPropertyName>
                                    Expire at
                                </StyledPropertyName>
                                <StyledPropertyDetails>
                                    {formatDateYMD(
                                        license.expireAt,
                                        locationSettings.locale,
                                    )}
                                </StyledPropertyDetails>
                            </StyledDataCollectionPropertyRow>
                        </div>
                    }
                    elseShow={
                        <p>
                            You do not have a registered Unleash Enterprise
                            License.
                        </p>
                    }
                />

                <form onSubmit={onSubmit}>
                    <TextField
                        onChange={updateToken}
                        label='New license key'
                        name='licenseKey'
                        value={token}
                        style={{ width: '100%' }}
                        variant='outlined'
                        size='small'
                        multiline
                        rows={6}
                        required
                    />
                    <Grid container spacing={3} marginTop={2}>
                        <Grid item md={5}>
                            <Button
                                variant='contained'
                                color='primary'
                                type='submit'
                                disabled={loading}
                            >
                                Update license key
                            </Button>{' '}
                            <p>
                                <small style={{ color: 'red' }}>
                                    {error?.message}
                                </small>
                            </p>
                        </Grid>
                    </Grid>
                </form>
            </StyledBox>
        </PageContent>
    );
};
