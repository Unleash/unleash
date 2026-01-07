import { type FormEventHandler, type VFC, useState, useCallback } from 'react';
import { Box, Button, Typography, Checkbox, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useFeatureTypeApi } from 'hooks/api/actions/useFeatureTypeApi/useFeatureTypeApi';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import NotFound from 'component/common/NotFound/NotFound';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { GO_BACK } from 'constants/navigate';
import Input from 'component/common/Input/Input';
import type { FeatureTypeSchema } from 'openapi';
import { trim } from 'component/common/util';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

type FeatureTypeFormProps = {
    featureType?: FeatureTypeSchema;
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
    featureType,
    loading,
}) => {
    const navigate = useNavigate();
    const { uiConfig } = useUiConfig();
    const { refetch } = useFeatureTypes();
    const { updateFeatureTypeLifetime, loading: actionLoading } =
        useFeatureTypeApi();
    const [lifetime, setLifetime] = useState<number>(
        featureType?.lifetimeDays || 0,
    );
    const [doesntExpire, setDoesntExpire] = useState<boolean>(
        !featureType?.lifetimeDays,
    );
    const { setToastData, setToastApiError } = useToast();
    const tracker = usePlausibleTracker();

    const onChangeLifetime = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(trim(e.target.value), 10);
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

    const onSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        try {
            if (!featureType?.id)
                throw new Error('No feature flag type loaded');

            const value = doesntExpire ? 0 : lifetime;
            await updateFeatureTypeLifetime(featureType.id, value);
            refetch();
            setToastData({
                text: 'Feature type updated',
                type: 'success',
            });
            navigate('/feature-toggle-type');
            tracker.trackEvent('feature-type-edit', {
                props: {
                    featureTypeId: featureType.id,
                    newLifetime: value,
                },
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = useCallback(
        () =>
            [
                `curl --location --request PUT '${uiConfig.unleashUrl}/api/admin/feature-types/${featureType?.id}/lifetime`,
                "--header 'Authorization: INSERT_API_KEY'",
                "--header 'Content-Type: application/json'",
                `--data-raw '{\n  "lifetimeDays": ${doesntExpire ? 0 : lifetime}\n}'`,
            ].join(' \\\n'),
        [uiConfig, featureType?.id, lifetime, doesntExpire],
    );

    if (!loading && !featureType) {
        return (
            <NotFound>
                <div data-testid='404_NOT_FOUND' />
            </NotFound>
        );
    }

    return (
        <FormTemplate
            modal
            title={
                loading
                    ? 'Edit flag type'
                    : `Edit flag type: ${featureType?.name}`
            }
            description={featureType?.description || ''}
            documentationLink='https://docs.getunleash.io/concepts/feature-flags#feature-flag-types'
            documentationLinkLabel='Feature flag types documentation'
            formatApiCode={formatApiCode}
        >
            <StyledForm component='form' onSubmit={onSubmit}>
                <Typography
                    sx={(theme) => ({
                        margin: theme.spacing(3, 0, 1),
                        display: 'flex',
                        alignItems: 'center',
                    })}
                >
                    <Box component='label' htmlFor='feature-flag-lifetime'>
                        Expected lifetime
                    </Box>
                    <HelpIcon
                        htmlTooltip
                        tooltip={
                            <>
                                <p>
                                    If your flag exceeds the expected lifetime
                                    of its flag type it will be marked as
                                    potentially stale.
                                </p>
                                <br />
                                <a
                                    href='https://docs.getunleash.io/concepts/feature-flags#feature-flag-types'
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    Read more in the documentation
                                </a>
                            </>
                        }
                    />
                </Typography>
                <Box
                    component='label'
                    sx={(theme) => ({
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        marginBottom: theme.spacing(1),
                        marginRight: 'auto',
                    })}
                    htmlFor='feature-flag-expire'
                >
                    <Checkbox
                        checked={doesntExpire || lifetime === 0}
                        id='feature-flag-expire'
                        onChange={onChangeDoesntExpire}
                        disabled={loading}
                    />
                    <Box>doesn't expire</Box>
                </Box>
                <Input
                    autoFocus
                    disabled={doesntExpire || loading}
                    type='number'
                    label='Lifetime in days'
                    id='feature-flag-lifetime'
                    value={doesntExpire ? '0' : `${lifetime}`}
                    onChange={onChangeLifetime}
                    error={isIncorrect}
                />
                <StyledButtons>
                    <PermissionButton
                        permission={ADMIN}
                        variant='contained'
                        color='primary'
                        type='submit'
                        disabled={loading || actionLoading}
                    >
                        Save feature flag type
                    </PermissionButton>
                    <Button
                        type='button'
                        color='primary'
                        onClick={() => navigate(GO_BACK)}
                    >
                        Cancel
                    </Button>
                </StyledButtons>
            </StyledForm>
        </FormTemplate>
    );
};
