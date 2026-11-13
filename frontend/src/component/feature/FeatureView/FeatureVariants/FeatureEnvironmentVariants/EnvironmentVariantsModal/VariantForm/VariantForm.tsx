import React, { Suspense, useEffect, useState } from 'react';
import Input from 'component/common/Input/Input';
import SelectMenu from 'component/common/select';
import {
    Button,
    type ButtonProps,
    InputAdornment,
    styled,
    Tooltip,
} from '@mui/material';
import type { IPayload } from 'interfaces/featureToggle';
import { WeightType } from 'constants/variantTypes';
import {
    FIXED_WEIGHT_EXPLANATION,
    TOTAL_WEIGHT,
    VARIABLE_WEIGHT_EXPLANATION,
} from 'component/feature/StrategyTypes/variantWeights';
import { calculateVariantWeight } from 'component/common/util';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import type { IFeatureVariantEdit } from '../EnvironmentVariantsModal.tsx';
import Delete from '@mui/icons-material/Delete';

const LazyReactJSONEditor = React.lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const StyledVariantForm = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(3),
    background: theme.palette.neutral.container,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const TopRow = styled('div')(({ theme }) => ({
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridAutoColumns: 'auto',
    gap: theme.spacing(2),
    alignItems: 'start',
    [theme.breakpoints.down('sm')]: {
        gridAutoFlow: 'row',
        gridTemplateColumns: '1fr',
    },
}));

const Dot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'color',
})<{ color?: string }>(({ theme, color }) => ({
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: '50%',
    background: color || 'transparent',
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
    display: 'inline-block',
}));

const Field = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const FieldLabelRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    height: theme.spacing(2.5),
}));

const FieldLabel = styled('label')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const formatButtonProps: ButtonProps = {
    size: 'small',
    startIcon: null,
    sx: (theme) => ({
        padding: theme.spacing(0, 1),
        minWidth: 0,
        fontSize: theme.typography.body2.fontSize,
    }),
};

const WeightInput = styled(Input)(({ theme }) => ({
    width: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}));

const PayloadTypeSelect = styled(SelectMenu)(({ theme }) => ({
    minWidth: theme.spacing(20),
}));

const ValueInput = styled(Input)({
    width: '100%',
    '& textarea': {
        resize: 'vertical',
        fontFamily: 'monospace',
    },
});

const RemoveButton = styled(Button)(({ theme }) => ({
    alignSelf: 'flex-start',
    marginLeft: theme.spacing(-0.5),
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.error.main,
    },
}));

const payloadOptions = [
    { key: 'string', label: 'string' },
    { key: 'json', label: 'JSON' },
    { key: 'csv', label: 'CSV' },
    { key: 'number', label: 'number' },
];

const EMPTY_PAYLOAD = { type: 'string' as const, value: '' };

enum ErrorField {
    NAME = 'name',
    PAYLOAD = 'payload',
}

interface IVariantFormErrors {
    [ErrorField.NAME]?: string;
    [ErrorField.PAYLOAD]?: string;
}

interface IVariantFormProps {
    variant: IFeatureVariantEdit;
    variants: IFeatureVariantEdit[];
    updateVariant: (updatedVariant: IFeatureVariantEdit) => void;
    changeWeight: (weight: number) => void;
    removeVariant: (variantId: string) => void;
    decorationColor?: string;
    weightsError?: boolean;
}

export const VariantForm = ({
    variant,
    variants,
    updateVariant,
    changeWeight,
    removeVariant,
    decorationColor,
    weightsError,
}: IVariantFormProps) => {
    const [name, setName] = useState(variant.name);
    const hasFixedWeight = variant.weightType === WeightType.FIX;
    const [percentage, setPercentage] = useState(
        String(calculateVariantWeight(variant.weight)),
    );
    const [payload, setPayload] = useState<IPayload>(
        variant.payload || EMPTY_PAYLOAD,
    );

    const [errors, setErrors] = useState<IVariantFormErrors>({});

    const clearError = (field: ErrorField) => {
        setErrors((errors) => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors((errors) => ({ ...errors, [field]: error }));
    };

    const editing = !variant.new;
    const weightInputVisible =
        variants.filter(
            ({ id, weightType }) =>
                id !== variant.id && weightType === WeightType.VARIABLE,
        ).length > 0;

    const isProtectedVariant = (variant: IFeatureVariantEdit): boolean => {
        const isVariable = variant.weightType === WeightType.VARIABLE;

        const atLeastOneFixedVariant = variants.some((variant) => {
            return variant.weightType === WeightType.FIX;
        });

        const hasOnlyOneVariableVariant =
            variants.filter((variant) => {
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
                'A variant with that name already exists for this environment.',
            );
        }
        setName(name.trim());
    };

    const fixedWeightOfOtherVariants = variants
        .filter(
            (other) =>
                other.id !== variant.id && other.weightType === WeightType.FIX,
        )
        .reduce((sum, other) => sum + other.weight, 0);
    const maxPercentage = (TOTAL_WEIGHT - fixedWeightOfOtherVariants) / 10;

    const onSetPercentage = (typedPercentage: string) => {
        if (typedPercentage === '') {
            setPercentage('');
            return;
        }
        if (!isValidPercentage(typedPercentage)) {
            return;
        }
        const percentage =
            Number(typedPercentage) > maxPercentage
                ? String(maxPercentage)
                : typedPercentage;
        setPercentage(percentage);
        changeWeight(Math.round(Number(percentage) * 10));
    };

    const validatePayload = (payload: IPayload) => {
        if (!isValidPayload(payload)) {
            setError(
                ErrorField.PAYLOAD,
                payload.type === 'json' ? 'Invalid JSON' : 'Invalid number',
            );
        }
    };

    const isNameNotEmpty = (name: string) => Boolean(name.length);
    const isNameUnique = (name: string, id: string) =>
        editing ||
        !variants.some((variant) => variant.name === name && variant.id !== id);
    const isValidPercentage = (percentage: string) => {
        if (percentage === '') return false;
        if (percentage.match(/\.[0-9]{2,}$/)) return false;

        const percentageNumber = Number(percentage);
        return percentageNumber >= 0 && percentageNumber <= 100;
    };
    const isValidPayload = (payload: IPayload): boolean => {
        try {
            if (payload.type === 'json' && payload.value.trim() !== '') {
                JSON.parse(payload.value);
            }
            if (payload.type === 'number') {
                return !Number.isNaN(Number(payload.value));
            }
            return true;
        } catch (_e: unknown) {
            return false;
        }
    };
    useEffect(() => {
        const newVariant: IFeatureVariantEdit = {
            ...variant,
            name,
            weight: variant.weight,
            stickiness:
                variants?.length > 0 ? variants[0].stickiness : 'default',
            payload: payload.value ? payload : undefined,
            isValid:
                isNameNotEmpty(name) &&
                isNameUnique(name, variant.id) &&
                isValidPercentage(percentage) &&
                isValidPayload(payload),
        };
        updateVariant(newVariant);
    }, [name, percentage, payload]);

    useEffect(() => {
        setPercentage(String(calculateVariantWeight(variant.weight)));
    }, [variant.weight]);

    const weightError = weightsError ? 'Total weight may not exceed 100%' : '';

    const weightInputId = `variant-weight-input-${variant.id}`;
    const weightExplanationId = `${weightInputId}-explanation`;
    const weightExplanation = hasFixedWeight
        ? FIXED_WEIGHT_EXPLANATION
        : VARIABLE_WEIGHT_EXPLANATION;
    const valueInputId = `variant-payload-value-${variant.id}`;

    return (
        <StyledVariantForm data-testid='VARIANT'>
            <TopRow>
                <Input
                    id={`variant-name-input-${variant.id}`}
                    data-testid='VARIANT_NAME_INPUT'
                    label={
                        <>
                            <Dot color={decorationColor} aria-hidden />
                            Variant name
                        </>
                    }
                    fullWidth
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    value={name}
                    onChange={(e) => onSetName(e.target.value)}
                    disabled={editing}
                    required
                />
                {weightInputVisible ? (
                    <Field>
                        <FieldLabelRow>
                            <FieldLabel htmlFor={weightInputId}>
                                Weight
                            </FieldLabel>
                            <HelpIcon tooltip={weightExplanation} />
                        </FieldLabelRow>
                        <WeightInput
                            id={weightInputId}
                            data-testid='VARIANT_WEIGHT_INPUT'
                            type='number'
                            label=''
                            error={Boolean(weightError)}
                            errorText={weightError}
                            value={percentage}
                            onChange={(e) => onSetPercentage(e.target.value)}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            %
                                        </InputAdornment>
                                    ),
                                },
                                htmlInput: {
                                    min: 0,
                                    max: maxPercentage,
                                    step: 'any', // auto-split weights have decimals; the browser's default step of 1 would reject them on submit
                                    'aria-describedby': weightExplanationId,
                                },
                            }}
                        />
                        <ScreenReaderOnly id={weightExplanationId}>
                            {weightExplanation}
                        </ScreenReaderOnly>
                    </Field>
                ) : null}
                <PayloadTypeSelect
                    id='variant-payload-type'
                    name='type'
                    label='Payload type'
                    value={payload.type}
                    options={payloadOptions}
                    onChange={(e) => {
                        clearError(ErrorField.PAYLOAD);
                        setPayload((payload) => ({
                            ...payload,
                            type: e.target.value as typeof payload.type,
                        }));
                    }}
                />
            </TopRow>
            <Field>
                <FieldLabelRow>
                    <FieldLabel htmlFor={valueInputId}>Value</FieldLabel>
                </FieldLabelRow>
                {payload.type === 'json' ? (
                    <Suspense fallback={null}>
                        <LazyReactJSONEditor
                            content={{ text: payload.value }}
                            placeholder='{"cta" : "Start free trial"}'
                            formatButtonProps={formatButtonProps}
                            onChange={(content) => {
                                clearError(ErrorField.PAYLOAD);
                                setPayload((payload) => ({
                                    ...payload,
                                    value:
                                        'json' in content
                                            ? JSON.stringify(content.json) || ''
                                            : content.text,
                                }));
                            }}
                        />
                    </Suspense>
                ) : (
                    <ValueInput
                        id={valueInputId}
                        label=''
                        multiline
                        minRows={4}
                        maxRows={14}
                        value={payload.value}
                        onChange={(e) => {
                            clearError(ErrorField.PAYLOAD);
                            setPayload((payload) => ({
                                ...payload,
                                value: e.target.value,
                            }));
                        }}
                        onBlur={() => validatePayload(payload)}
                        error={Boolean(errors.payload)}
                        errorText={errors.payload}
                    />
                )}
            </Field>
            <Tooltip
                arrow
                title={
                    isProtectedVariant(variant)
                        ? 'You need to have at least one variable variant'
                        : ''
                }
            >
                <span>
                    <RemoveButton
                        variant='text'
                        startIcon={<Delete />}
                        data-testid={`VARIANT_DELETE_BUTTON_${variant.name}`}
                        onClick={() => removeVariant(variant.id)}
                        disabled={isProtectedVariant(variant)}
                    >
                        Remove variant
                    </RemoveButton>
                </span>
            </Tooltip>
        </StyledVariantForm>
    );
};
