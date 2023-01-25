import {
    Alert,
    Button,
    FormControlLabel,
    InputAdornment,
    styled,
} from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { FormEvent, useEffect, useState } from 'react';
import Input from 'component/common/Input/Input';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    IFeatureEnvironment,
    IFeatureVariant,
    IPayload,
} from 'interfaces/featureToggle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { Operation } from 'fast-json-patch';
import { useOverrides } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantModal/VariantOverrides/useOverrides';
import SelectMenu from 'component/common/select';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { OverrideConfig } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantModal/VariantOverrides/VariantOverrides';
import cloneDeep from 'lodash.clonedeep';
import { CloudCircle } from '@mui/icons-material';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_FEATURE_VARIANTS } from 'component/providers/AccessProvider/permissions';
import { WeightType } from 'constants/variantTypes';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useChangeRequestInReviewWarning } from 'hooks/useChangeRequestInReviewWarning';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';

const StyledFormSubtitle = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(-1.5),
    marginBottom: theme.spacing(4),
}));

const StyledCloudCircle = styled(CloudCircle, {
    shouldForwardProp: prop => prop !== 'deprecated',
})<{ deprecated?: boolean }>(({ theme, deprecated }) => ({
    color: deprecated
        ? theme.palette.neutral.border
        : theme.palette.primary.main,
}));

const StyledName = styled('span', {
    shouldForwardProp: prop => prop !== 'deprecated',
})<{ deprecated?: boolean }>(({ theme, deprecated }) => ({
    color: deprecated
        ? theme.palette.text.secondary
        : theme.palette.text.primary,
    marginLeft: theme.spacing(1.25),
}));

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    display: 'flex',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    '&:not(:first-of-type)': {
        marginTop: theme.spacing(4),
    },
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(1.5),
}));

const StyledInputSecondaryDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(() => ({
    width: '100%',
}));

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    rowGap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        '& > div, .MuiInputBase-root': {
            width: '100%',
        },
    },
}));

const StyledSelectMenu = styled(SelectMenu)(({ theme }) => ({
    minWidth: theme.spacing(20),
    marginRight: theme.spacing(10),
}));

const StyledCRAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(4),
    },
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const payloadOptions = [
    { key: 'string', label: 'string' },
    { key: 'json', label: 'json' },
    { key: 'csv', label: 'csv' },
];

const EMPTY_PAYLOAD = { type: 'string', value: '' };

enum ErrorField {
    NAME = 'name',
    PERCENTAGE = 'percentage',
    PAYLOAD = 'payload',
    OTHER = 'other',
}

interface IEnvironmentVariantModalErrors {
    [ErrorField.NAME]?: string;
    [ErrorField.PERCENTAGE]?: string;
    [ErrorField.PAYLOAD]?: string;
    [ErrorField.OTHER]?: string;
}

interface IEnvironmentVariantModalProps {
    environment?: IFeatureEnvironment;
    variant?: IFeatureVariant;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    getApiPayload: (
        variants: IFeatureVariant[],
        newVariants: IFeatureVariant[]
    ) => { patch: Operation[]; error?: string };
    getCrPayload: (variants: IFeatureVariant[]) => {
        feature: string;
        action: 'patchVariant';
        payload: { variants: IFeatureVariant[] };
    };
    onConfirm: (updatedVariants: IFeatureVariant[]) => void;
}

export const EnvironmentVariantModal = ({
    environment,
    variant,
    open,
    setOpen,
    getApiPayload,
    getCrPayload,
    onConfirm,
}: IEnvironmentVariantModalProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');

    const { uiConfig } = useUiConfig();

    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { data } = usePendingChangeRequests(projectId);
    const { changeRequestInReviewOrApproved, alert } =
        useChangeRequestInReviewWarning(data);

    const [name, setName] = useState('');
    const [customPercentage, setCustomPercentage] = useState(false);
    const [percentage, setPercentage] = useState('');
    const [payload, setPayload] = useState<IPayload>(EMPTY_PAYLOAD);
    const [overrides, overridesDispatch] = useOverrides([]);
    const { context } = useUnleashContext();

    const [errors, setErrors] = useState<IEnvironmentVariantModalErrors>({});

    const clearError = (field: ErrorField) => {
        setErrors(errors => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors(errors => ({ ...errors, [field]: error }));
    };

    const editing = Boolean(variant);
    const variants = environment?.variants || [];
    const customPercentageVisible =
        (editing && variants.length > 1) || (!editing && variants.length > 0);

    useEffect(() => {
        if (variant) {
            setName(variant.name);
            setCustomPercentage(variant.weightType === WeightType.FIX);
            setPercentage(String(variant.weight / 10));
            setPayload(variant.payload || EMPTY_PAYLOAD);
            overridesDispatch(
                variant.overrides
                    ? { type: 'SET', payload: variant.overrides || [] }
                    : { type: 'CLEAR' }
            );
        } else {
            setName('');
            setCustomPercentage(false);
            setPercentage('');
            setPayload(EMPTY_PAYLOAD);
            overridesDispatch({ type: 'CLEAR' });
        }
        setErrors({});
    }, [open, variant]);

    const getUpdatedVariants = (): IFeatureVariant[] => {
        const newVariant: IFeatureVariant = {
            name,
            weight: Number(customPercentage ? percentage : 100) * 10,
            weightType: customPercentage ? WeightType.FIX : WeightType.VARIABLE,
            stickiness:
                variants?.length > 0 ? variants[0].stickiness : 'default',
            payload: payload.value ? payload : undefined,
            overrides: overrides
                .map(o => ({
                    contextName: o.contextName,
                    values: o.values,
                }))
                .filter(o => o.values && o.values.length > 0),
        };

        const updatedVariants = cloneDeep(variants);

        if (editing) {
            const variantIdxToUpdate = updatedVariants.findIndex(
                (variant: IFeatureVariant) => variant.name === newVariant.name
            );
            updatedVariants[variantIdxToUpdate] = newVariant;
        } else {
            updatedVariants.push(newVariant);
        }

        return updatedVariants;
    };

    const apiPayload = getApiPayload(variants, getUpdatedVariants());
    const crPayload = getCrPayload(getUpdatedVariants());

    useEffect(() => {
        clearError(ErrorField.PERCENTAGE);
        clearError(ErrorField.OTHER);
        if (apiPayload.error) {
            if (apiPayload.error.includes('%')) {
                setError(ErrorField.PERCENTAGE, apiPayload.error);
            } else {
                setError(ErrorField.OTHER, apiPayload.error);
            }
        }
    }, [apiPayload.error]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onConfirm(getUpdatedVariants());
    };

    const formatApiCode = () =>
        isChangeRequest
            ? `curl --location --request POST '${
                  uiConfig.unleashUrl
              }/api/admin/projects/${projectId}/environments/${
                  environment?.name
              }/change-requests' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(crPayload, undefined, 2)}'`
            : `curl --location --request PATCH '${
                  uiConfig.unleashUrl
              }/api/admin/projects/${projectId}/features/${featureId}/environments/${
                  environment?.name
              }/variants' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(apiPayload.patch, undefined, 2)}'`;

    const isNameNotEmpty = (name: string) => name.length;
    const isNameUnique = (name: string) =>
        editing || !variants.some(variant => variant.name === name);
    const isValidPercentage = (percentage: string) => {
        if (!customPercentage) return true;
        if (percentage === '') return false;
        if (percentage.match(/\.[0-9]{2,}$/)) return false;

        const percentageNumber = Number(percentage);
        return percentageNumber >= 0 && percentageNumber <= 100;
    };
    const isValidPayload = (payload: IPayload): boolean => {
        try {
            if (payload.type === 'json') {
                JSON.parse(payload.value);
            }
            return true;
        } catch (e: unknown) {
            return false;
        }
    };
    const isValid =
        isNameNotEmpty(name) &&
        isNameUnique(name) &&
        isValidPercentage(percentage) &&
        isValidPayload(payload) &&
        !apiPayload.error;

    const onSetName = (name: string) => {
        clearError(ErrorField.NAME);
        if (!isNameUnique(name)) {
            setError(
                ErrorField.NAME,
                'A variant with that name already exists for this environment.'
            );
        }
        setName(name);
    };

    const onSetPercentage = (percentage: string) => {
        if (percentage === '' || isValidPercentage(percentage)) {
            setPercentage(percentage);
        }
    };

    const validatePayload = (payload: IPayload) => {
        if (!isValidPayload(payload)) {
            setError(ErrorField.PAYLOAD, 'Invalid JSON.');
        }
    };

    const onAddOverride = () => {
        if (context.length > 0) {
            overridesDispatch({
                type: 'ADD',
                payload: { contextName: context[0].name, values: [] },
            });
        }
    };

    const hasChangeRequestInReviewForEnvironment =
        changeRequestInReviewOrApproved(environment?.name || '');

    const changeRequestButtonText = hasChangeRequestInReviewForEnvironment
        ? 'Add to existing change request'
        : 'Add change to draft';

    const isChangeRequest = isChangeRequestConfigured(environment?.name || '');

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={editing ? 'Edit variant' : 'Add variant'}
        >
            <FormTemplate
                modal
                title={editing ? 'Edit variant' : 'Add variant'}
                description="Variants allows you to return a variant object if the feature toggle is considered enabled for the current request."
                documentationLink="https://docs.getunleash.io/reference/feature-toggle-variants"
                documentationLinkLabel="Feature toggle variants documentation"
                formatApiCode={formatApiCode}
                loading={!open}
            >
                <StyledFormSubtitle>
                    <StyledCloudCircle deprecated={!environment?.enabled} />
                    <StyledName deprecated={!environment?.enabled}>
                        {environment?.name}
                    </StyledName>
                </StyledFormSubtitle>
                <StyledForm onSubmit={handleSubmit}>
                    <div>
                        <ConditionallyRender
                            condition={hasChangeRequestInReviewForEnvironment}
                            show={alert}
                            elseShow={
                                <ConditionallyRender
                                    condition={Boolean(isChangeRequest)}
                                    show={
                                        <StyledCRAlert severity="info">
                                            <strong>Change requests</strong> are
                                            enabled
                                            {environment
                                                ? ` for ${environment.name}`
                                                : ''}
                                            . Your changes need to be approved
                                            before they will be live. All the
                                            changes you do now will be added
                                            into a draft that you can submit for
                                            review.
                                        </StyledCRAlert>
                                    }
                                />
                            }
                        />
                        <StyledInputDescription>
                            Variant name
                        </StyledInputDescription>
                        <StyledInputSecondaryDescription>
                            This will be used to identify the variant in your
                            code
                        </StyledInputSecondaryDescription>
                        <StyledInput
                            autoFocus
                            label="Variant name"
                            error={Boolean(errors.name)}
                            errorText={errors.name}
                            value={name}
                            onChange={e => onSetName(e.target.value)}
                            disabled={editing}
                            required
                        />
                        <ConditionallyRender
                            condition={customPercentageVisible}
                            show={
                                <StyledFormControlLabel
                                    label="Custom percentage"
                                    control={
                                        <PermissionSwitch
                                            permission={UPDATE_FEATURE_VARIANTS}
                                            projectId={projectId}
                                            checked={customPercentage}
                                            onChange={e =>
                                                setCustomPercentage(
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    }
                                />
                            }
                        />
                        <ConditionallyRender
                            condition={customPercentage}
                            show={
                                <StyledInput
                                    type="number"
                                    label="Variant weight"
                                    error={Boolean(errors.percentage)}
                                    errorText={errors.percentage}
                                    value={percentage}
                                    onChange={e =>
                                        onSetPercentage(e.target.value)
                                    }
                                    required={customPercentage}
                                    disabled={!customPercentage}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                %
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            }
                        />
                        <StyledInputDescription>
                            Payload
                            <HelpIcon tooltip="Passed along with the the variant object." />
                        </StyledInputDescription>
                        <StyledRow>
                            <StyledSelectMenu
                                id="variant-payload-type"
                                name="type"
                                label="Type"
                                value={payload.type}
                                options={payloadOptions}
                                onChange={e => {
                                    clearError(ErrorField.PAYLOAD);
                                    setPayload(payload => ({
                                        ...payload,
                                        type: e.target.value,
                                    }));
                                }}
                            />
                            <StyledInput
                                id="variant-payload-value"
                                name="variant-payload-value"
                                label="Value"
                                multiline={payload.type !== 'string'}
                                rows={payload.type === 'string' ? 1 : 4}
                                value={payload.value}
                                onChange={e => {
                                    clearError(ErrorField.PAYLOAD);
                                    setPayload(payload => ({
                                        ...payload,
                                        value: e.target.value,
                                    }));
                                }}
                                placeholder={
                                    payload.type === 'json'
                                        ? '{ "hello": "world" }'
                                        : ''
                                }
                                onBlur={() => validatePayload(payload)}
                                error={Boolean(errors.payload)}
                                errorText={errors.payload}
                            />
                        </StyledRow>
                        <StyledInputDescription>
                            Overrides
                            <HelpIcon tooltip="Here you can specify which users should get this variant." />
                        </StyledInputDescription>
                        <OverrideConfig
                            overrides={overrides}
                            overridesDispatch={overridesDispatch}
                        />
                        <Button
                            onClick={onAddOverride}
                            variant="outlined"
                            color="primary"
                        >
                            Add override
                        </Button>
                    </div>
                    <StyledAlert
                        severity="error"
                        hidden={!Boolean(errors.other)}
                    >
                        <strong>Error: </strong>
                        {errors.other}
                    </StyledAlert>

                    <StyledButtonContainer>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!isValid}
                        >
                            {isChangeRequest
                                ? changeRequestButtonText
                                : editing
                                ? 'Save variant'
                                : 'Add variant'}
                        </Button>
                        <StyledCancelButton
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </StyledCancelButton>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
