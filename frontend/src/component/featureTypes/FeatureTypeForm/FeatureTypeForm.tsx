import { type FormEventHandler, type VFC, useState, useMemo } from 'react';
import { Box, Button, Typography, Checkbox, styled } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useFeatureTypeApi } from 'hooks/api/actions/useFeatureTypeApi/useFeatureTypeApi';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import NotFound from 'component/common/NotFound/NotFound';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { GO_BACK } from 'constants/navigate';
import Input from 'component/common/Input/Input';
import { FeatureTypeSchema } from 'openapi';
import { trim } from 'component/common/util';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';

type FeatureTypeFormProps = {
    featureTypes: FeatureTypeSchema[];
    loading: boolean;
};

const StyledButtons = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 'auto',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(4),
}));

const StyledForm = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
}));

export const FeatureTypeForm: VFC<FeatureTypeFormProps> = ({
    featureTypes,
    loading,
}) => {
    const { featureTypeId } = useParams();
    const navigate = useNavigate();
    const { uiConfig } = useUiConfig();
    const featureType = featureTypes.find(
        featureType => featureType.id === featureTypeId
    );
    const { refetch } = useFeatureTypes();
    const { updateFeatureTypeLifetime, loading: actionLoading } =
        useFeatureTypeApi();
    const [lifetime, setLifetime] = useState<number>(
        featureType?.lifetimeDays || 0
    );
    const [doesntExpire, setDoesntExpire] = useState<boolean>(
        !featureType?.lifetimeDays
    );
    const { setToastData, setToastApiError } = useToast();

    const onChangeLifetime = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(trim(e.target.value), 10);
        setLifetime(value);
        if (value === 0) {
            setDoesntExpire(true);
        }
    };

    const onChangeDoesntExpire = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDoesntExpire(e.target.checked);
        if (lifetime === 0) {
            setLifetime(featureType?.lifetimeDays || 1);
        }
    };

    const isIncorrect =
        !doesntExpire && (Number.isNaN(lifetime) || lifetime < 0);

    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        try {
            if (!featureTypeId)
                throw new Error('No feature toggle type loaded');

            const value = doesntExpire ? 0 : lifetime;
            await updateFeatureTypeLifetime(featureTypeId, value);
            refetch();
            setToastData({
                title: 'Feature type updated',
                type: 'success',
            });
            navigate('/feature-toggle-type');
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const apiCode = useMemo(
        () =>
            [
                `curl --location --request PUT '${uiConfig.unleashUrl}/api/admin/feature-types/${featureTypeId}/lifetime`,
                "--header 'Authorization: INSERT_API_KEY'",
                "--header 'Content-Type: application/json'",
                '--data-raw \'{\n  "lifetimeDays": 7\n}\'',
            ].join(' \\\n'),
        [uiConfig, featureTypeId]
    );

    if (!loading && !featureType) {
        return <NotFound />;
    }

    return (
        <FormTemplate
            modal
            title={
                loading
                    ? 'Edit toggle type'
                    : `Edit toggle type: ${featureType?.name}`
            }
            description={featureType?.description || ''}
            documentationLink="https://docs.getunleash.io/reference/feature-toggle-types"
            documentationLinkLabel="Feature toggle types documentation"
            formatApiCode={() => apiCode}
        >
            <StyledForm component="form" onSubmit={onSubmit}>
                <Typography
                    sx={theme => ({
                        margin: theme.spacing(3, 0, 1),
                        display: 'flex',
                        alignItems: 'center',
                    })}
                >
                    <Box component="label" htmlFor="feature-toggle-lifetime">
                        Expected lifetime
                    </Box>
                    <HelpIcon
                        htmlTooltip
                        tooltip={
                            <>
                                <p>
                                    If your toggle exceeded lifetime of it's
                                    type it will be marked as potencially stale.
                                </p>
                                <br />
                                <a
                                    href="https://docs.getunleash.io/reference/feature-toggle-types#expected-lifetime"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Read more in the documentation
                                </a>
                            </>
                        }
                    />
                </Typography>
                <Box
                    component="label"
                    sx={theme => ({
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        marginBottom: theme.spacing(1),
                        marginRight: 'auto',
                    })}
                    htmlFor="feature-toggle-expire"
                >
                    <Checkbox
                        checked={doesntExpire || lifetime === 0}
                        id="feature-toggle-expire"
                        onChange={onChangeDoesntExpire}
                    />
                    <Box>doesn't expire</Box>
                </Box>
                <Input
                    autoFocus
                    disabled={doesntExpire}
                    type="number"
                    label="Lifetime in days"
                    id="feature-toggle-lifetime"
                    value={doesntExpire ? '0' : `${lifetime}`}
                    onChange={onChangeLifetime}
                    error={isIncorrect}
                />
                <StyledButtons>
                    <PermissionButton
                        permission={ADMIN}
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={loading || actionLoading}
                    >
                        Save feature toggle type
                    </PermissionButton>
                    <Button
                        type="button"
                        color="primary"
                        onClick={() => navigate(GO_BACK)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </StyledButtons>
            </StyledForm>
        </FormTemplate>
    );
};
