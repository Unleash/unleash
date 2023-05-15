import { useEffect, useState } from 'react';
import Input from 'component/common/Input/Input';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import SelectMenu from 'component/common/select';
import { OverrideConfig } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/VariantForm/VariantOverrides/VariantOverrides';
import {
    Button,
    FormControlLabel,
    IconButton,
    InputAdornment,
    styled,
    Switch,
    Tooltip,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IPayload } from 'interfaces/featureToggle';
import { useOverrides } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/VariantForm/VariantOverrides/useOverrides';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { WeightType } from 'constants/variantTypes';
import { IFeatureVariantEdit } from '../EnvironmentVariantsModal';
import { Operation } from 'fast-json-patch';
import { Delete } from '@mui/icons-material';

const StyledVariantForm = styled('div')(({ theme }) => ({
    position: 'relative',
    backgroundColor: theme.palette.neutral.light,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledDeleteButtonTooltip = styled(Tooltip)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
}));

const StyledLabel = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledMarginLabel = styled(StyledLabel)(({ theme }) => ({
    display: 'flex',
    color: theme.palette.text.primary,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
}));

const StyledSubLabel = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    '& > span': {
        fontSize: theme.fontSizes.smallBody,
    },
    [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1.5),
    },
}));

const StyledFieldColumn = styled('div')(({ theme }) => ({
    width: '100%',
    gap: theme.spacing(1.5),
    display: 'flex',
    '& > div': {
        width: '100%',
    },
}));

const StyledInput = styled(Input)(() => ({
    width: '100%',
}));

const StyledPercentageContainer = styled('div')(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const StyledWeightInput = styled(Input)(({ theme }) => ({
    width: theme.spacing(24),
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}));

const StyledNameContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
    flexGrow: 1,
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

const StyledTopRow = styled(StyledRow)({
    alignItems: 'end',
    justifyContent: 'space-between',
});

const StyledSelectMenu = styled(SelectMenu)(({ theme }) => ({
    marginRight: theme.spacing(10),
    [theme.breakpoints.up('sm')]: {
        minWidth: theme.spacing(20),
    },
}));

const StyledAddOverrideButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(-1),
    marginLeft: theme.spacing(-1),
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

interface IVariantFormErrors {
    [ErrorField.NAME]?: string;
    [ErrorField.PERCENTAGE]?: string;
    [ErrorField.PAYLOAD]?: string;
    [ErrorField.OTHER]?: string;
}

interface IVariantFormProps {
    variant: IFeatureVariantEdit;
    variants: IFeatureVariantEdit[];
    updateVariant: (updatedVariant: IFeatureVariantEdit) => void;
    removeVariant: (variantId: string) => void;
    projectId: string;
    apiPayload: {
        patch: Operation[];
        error?: string;
    };
}

export const VariantForm = ({
    variant,
    variants,
    updateVariant,
    removeVariant,
    apiPayload,
}: IVariantFormProps) => {
    const [name, setName] = useState(variant.name);
    const [customPercentage, setCustomPercentage] = useState(
        variant.weightType === WeightType.FIX
    );
    const [percentage, setPercentage] = useState(String(variant.weight / 10));
    const [payload, setPayload] = useState<IPayload>(
        variant.payload || EMPTY_PAYLOAD
    );
    const [overrides, overridesDispatch] = useOverrides(
        variant.overrides || []
    );
    const { context } = useUnleashContext();

    const [errors, setErrors] = useState<IVariantFormErrors>({});

    const clearError = (field: ErrorField) => {
        setErrors(errors => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors(errors => ({ ...errors, [field]: error }));
    };

    useEffect(() => {
        clearError(ErrorField.PERCENTAGE);
        if (apiPayload.error?.includes('%')) {
            setError(ErrorField.PERCENTAGE, 'Total weight must equal 100%');
        }
    }, [apiPayload.error]);

    const editing = !variant.new;
    const customPercentageVisible =
        variants.filter(
            ({ id, weightType }) =>
                id !== variant.id && weightType === WeightType.VARIABLE
        ).length > 0;

    const isProtectedVariant = (variant: IFeatureVariantEdit): boolean => {
        const isVariable = variant.weightType === WeightType.VARIABLE;

        const atLeastOneFixedVariant = variants.some(variant => {
            return variant.weightType === WeightType.FIX;
        });

        const hasOnlyOneVariableVariant =
            variants.filter(variant => {
                return variant.weightType === WeightType.VARIABLE;
            }).length === 1;

        return (
            atLeastOneFixedVariant && hasOnlyOneVariableVariant && isVariable
        );
    };

    const onSetName = (name: string) => {
        clearError(ErrorField.NAME);
        if (!isNameUnique(name, variant.id)) {
            setError(
                ErrorField.NAME,
                'A variant with that name already exists for this environment.'
            );
        }
        setName(name.trim());
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

    const isNameNotEmpty = (name: string) => Boolean(name.length);
    const isNameUnique = (name: string, id: string) =>
        editing ||
        !variants.some(variant => variant.name === name && variant.id !== id);
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

    useEffect(() => {
        updateVariant({
            ...variant,
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
            isValid:
                isNameNotEmpty(name) &&
                isNameUnique(name, variant.id) &&
                isValidPercentage(percentage) &&
                isValidPayload(payload) &&
                !apiPayload.error,
        });
    }, [name, customPercentage, percentage, payload, overrides]);

    useEffect(() => {
        if (!customPercentage) {
            setPercentage(String(variant.weight / 10));
        }
    }, [variant.weight]);

    return (
        <StyledVariantForm data-testid="VARIANT">
            <StyledDeleteButtonTooltip
                arrow
                title={
                    isProtectedVariant(variant)
                        ? 'You need to have at least one variable variant'
                        : 'Delete variant'
                }
            >
                <div>
                    <IconButton
                        data-testid={`VARIANT_DELETE_BUTTON_${variant.name}`}
                        onClick={() => removeVariant(variant.id)}
                        disabled={isProtectedVariant(variant)}
                    >
                        <Delete />
                    </IconButton>
                </div>
            </StyledDeleteButtonTooltip>
            <StyledTopRow>
                <StyledNameContainer>
                    <StyledLabel>Variant name</StyledLabel>
                    <StyledSubLabel>
                        This will be used to identify the variant in your code
                    </StyledSubLabel>
                    <StyledInput
                        id={`variant-name-input-${variant.id}`}
                        data-testid="VARIANT_NAME_INPUT"
                        label="Variant name"
                        error={Boolean(errors.name)}
                        errorText={errors.name}
                        value={name}
                        onChange={e => onSetName(e.target.value)}
                        disabled={editing}
                        required
                    />
                </StyledNameContainer>
                <ConditionallyRender
                    condition={customPercentageVisible}
                    show={
                        <StyledPercentageContainer>
                            <StyledFormControlLabel
                                label="Custom percentage"
                                control={
                                    <Switch
                                        data-testid="VARIANT_WEIGHT_CHECK"
                                        checked={customPercentage}
                                        onChange={e =>
                                            setCustomPercentage(
                                                e.target.checked
                                            )
                                        }
                                    />
                                }
                            />
                            <StyledWeightInput
                                data-testid="VARIANT_WEIGHT_INPUT"
                                type="number"
                                label="Variant weight"
                                error={Boolean(errors.percentage)}
                                errorText={errors.percentage}
                                value={percentage}
                                onChange={e => onSetPercentage(e.target.value)}
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
                        </StyledPercentageContainer>
                    }
                />
            </StyledTopRow>
            <StyledMarginLabel>
                Payload
                <HelpIcon tooltip="Passed along with the the variant object." />
            </StyledMarginLabel>
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
                <StyledFieldColumn>
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
                </StyledFieldColumn>
            </StyledRow>
            <StyledMarginLabel>
                Overrides
                <HelpIcon tooltip="Here you can specify which users should get this variant." />
            </StyledMarginLabel>
            <OverrideConfig
                overrides={overrides}
                overridesDispatch={overridesDispatch}
            />
            <div>
                <StyledAddOverrideButton
                    onClick={onAddOverride}
                    variant="text"
                    color="primary"
                    data-testid="VARIANT_ADD_OVERRIDE_BUTTON"
                >
                    Add override
                </StyledAddOverrideButton>
            </div>
        </StyledVariantForm>
    );
};
