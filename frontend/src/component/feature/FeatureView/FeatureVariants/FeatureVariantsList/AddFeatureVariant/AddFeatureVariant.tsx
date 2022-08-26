import React, { useEffect, useState } from 'react';
import {
    Button,
    FormControl,
    FormControlLabel,
    Grid,
    InputAdornment,
} from '@mui/material';
import { weightTypes } from './enums';
import { OverrideConfig } from './OverrideConfig/OverrideConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useThemeStyles } from 'themes/themeStyles';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { modalStyles, trim } from 'component/common/util';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { UPDATE_FEATURE_VARIANTS } from 'component/providers/AccessProvider/permissions';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { IFeatureVariant } from 'interfaces/featureToggle';
import cloneDeep from 'lodash.clonedeep';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useStyles } from './AddFeatureVariant.styles';
import Input from 'component/common/Input/Input';
import { formatUnknownError } from 'utils/formatUnknownError';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { useOverrides } from './useOverrides';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

const payloadOptions = [
    { key: 'string', label: 'string' },
    { key: 'json', label: 'json' },
    { key: 'csv', label: 'csv' },
];

const EMPTY_PAYLOAD = { type: 'string', value: '' };

interface IAddVariantProps {
    showDialog: boolean;
    closeDialog: () => void;
    save: (variantToSave: IFeatureVariant) => Promise<void>;
    editVariant: IFeatureVariant;
    validateName: (value: string) => Record<string, string> | undefined;
    validateWeight: (value: string) => Record<string, string> | undefined;
    title: string;
    editing: boolean;
}

export const AddVariant = ({
    showDialog,
    closeDialog,
    save,
    editVariant,
    validateName,
    validateWeight,
    title,
    editing,
}: IAddVariantProps) => {
    const { classes: styles } = useStyles();
    const [data, setData] = useState<Record<string, string>>({});
    const [payload, setPayload] = useState(EMPTY_PAYLOAD);
    const [overrides, overridesDispatch] = useOverrides([]);
    const [error, setError] = useState<Record<string, string>>({});
    const { classes: themeStyles } = useThemeStyles();
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);
    const [variants, setVariants] = useState<IFeatureVariant[]>([]);
    const { context } = useUnleashContext();

    const isValidJSON = (input: string): boolean => {
        try {
            JSON.parse(input);
            return true;
        } catch (e: unknown) {
            setError({
                payload: 'Invalid JSON',
            });
            return false;
        }
    };

    const clear = () => {
        if (editVariant) {
            setData({
                name: editVariant.name,
                weight: String(editVariant.weight / 10),
                weightType: editVariant.weightType || weightTypes.VARIABLE,
                stickiness: editVariant.stickiness,
            });
            if (editVariant.payload) {
                setPayload(editVariant.payload);
            } else {
                setPayload(EMPTY_PAYLOAD);
            }
            if (editVariant.overrides) {
                overridesDispatch({
                    type: 'SET',
                    payload: editVariant.overrides,
                });
            } else {
                overridesDispatch({ type: 'CLEAR' });
            }
        } else {
            setData({});
            setPayload(EMPTY_PAYLOAD);
            overridesDispatch({ type: 'CLEAR' });
        }
        setError({});
    };

    const setClonedVariants = (clonedVariants: IFeatureVariant[]) =>
        setVariants(cloneDeep(clonedVariants));

    useEffect(() => {
        if (feature) {
            setClonedVariants(feature.variants);
        }
    }, [feature.variants]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        clear();
    }, [editVariant]); // eslint-disable-line react-hooks/exhaustive-deps

    const setVariantValue = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: trim(value),
        });
    };

    const setVariantWeightType = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked, name } = e.target;
        const weightType = checked ? weightTypes.FIX : weightTypes.VARIABLE;
        setData({
            ...data,
            [name]: weightType,
        });
    };

    const submit = async (e: React.FormEvent) => {
        setError({});
        e.preventDefault();

        const nameValidation = validateName(data.name);
        if (nameValidation) {
            setError(nameValidation);
            return;
        }
        const weightValidation = validateWeight(data.weight);
        if (weightValidation) {
            setError(weightValidation);
            return;
        }
        const validJSON =
            payload.type === 'json' && !isValidJSON(payload.value);
        if (validJSON) {
            return;
        }

        try {
            const variant: IFeatureVariant = {
                name: data.name,
                weight: Number(data.weight) * 10,
                weightType: data.weightType,
                stickiness: data.stickiness,
                payload: payload.value ? payload : undefined,
                overrides: overrides
                    .map(o => ({
                        contextName: o.contextName,
                        values: o.values,
                    }))
                    .filter(o => o.values && o.values.length > 0),
            };
            await save(variant);
            clear();
            closeDialog();
        } catch (e: unknown) {
            const error = formatUnknownError(e);
            if (error.includes('duplicate value')) {
                setError({ name: 'A variant with that name already exists.' });
            } else if (error.includes('must be a number')) {
                setError({ weight: 'Weight must be a number' });
            } else {
                const msg = error || 'Could not add variant';
                setError({ general: msg });
            }
        }
    };

    const onPayload = (name: string) => (value: string) => {
        setError({ payload: '' });
        setPayload({ ...payload, [name]: value });
    };

    const onCancel = (e: React.SyntheticEvent) => {
        e.preventDefault();
        clear();
        closeDialog();
    };

    const onAddOverride = () => {
        if (context.length > 0) {
            overridesDispatch({
                type: 'ADD',
                payload: { contextName: context[0].name, values: [] },
            });
        }
    };

    const isFixWeight = data.weightType === weightTypes.FIX;

    const formId = 'add-feature-variant-form';

    return (
        <Dialogue
            open={showDialog}
            style={modalStyles}
            onClose={onCancel}
            onClick={submit}
            primaryButtonText="Save"
            secondaryButtonText="Cancel"
            title={title}
            fullWidth
            maxWidth="md"
            formId={formId}
        >
            <form
                id={formId}
                onSubmit={submit}
                className={themeStyles.contentSpacingY}
            >
                <p className={styles.error}>{error.general}</p>
                <Input
                    label="Variant name"
                    autoFocus
                    name="name"
                    id="variant-name"
                    className={styles.input}
                    errorText={error.name}
                    value={data.name || ''}
                    error={Boolean(error.name)}
                    required
                    type="name"
                    disabled={editing}
                    onChange={setVariantValue}
                    data-testid={'VARIANT_NAME_INPUT'}
                />
                <br />
                <Grid container>
                    {/* If we're editing, we need to have at least 2 existing variants, since we require at least 1 variable. If adding, we could be adding nr 2, and as such should be allowed to set weightType to variable */}
                    <ConditionallyRender
                        condition={
                            (editing && variants.length > 1) ||
                            (!editing && variants.length > 0)
                        }
                        show={
                            <Grid item md={12} className={styles.grid}>
                                <FormControl>
                                    <FormControlLabel
                                        control={
                                            <PermissionSwitch
                                                permission={
                                                    UPDATE_FEATURE_VARIANTS
                                                }
                                                projectId={projectId}
                                                name="weightType"
                                                checked={isFixWeight}
                                                data-testid={
                                                    'VARIANT_WEIGHT_CHECK'
                                                }
                                                onChange={setVariantWeightType}
                                            />
                                        }
                                        label="Custom percentage"
                                    />
                                </FormControl>
                            </Grid>
                        }
                    />

                    <ConditionallyRender
                        condition={data.weightType === weightTypes.FIX}
                        show={
                            <Grid item md={4}>
                                <Input
                                    id="weight"
                                    label="Variant weight"
                                    name="weight"
                                    data-testid={'VARIANT_WEIGHT_INPUT'}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="start">
                                                %
                                            </InputAdornment>
                                        ),
                                    }}
                                    className={styles.weightInput}
                                    value={data.weight}
                                    error={Boolean(error.weight)}
                                    errorText={error.weight}
                                    type="number"
                                    disabled={!isFixWeight}
                                    onChange={e => {
                                        setVariantValue(e);
                                    }}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                />
                            </Grid>
                        }
                    />
                </Grid>
                <p className={styles.label}>
                    <strong>Payload </strong>
                    <HelpIcon tooltip="Passed along with the the variant object." />
                </p>
                <Grid container>
                    <Grid item md={2} sm={2} xs={4}>
                        <GeneralSelect
                            id="variant-payload-type"
                            name="type"
                            label="Type"
                            className={styles.select}
                            value={payload.type}
                            options={payloadOptions}
                            onChange={onPayload('type')}
                        />
                    </Grid>
                    <Grid item md={8} sm={8} xs={6}>
                        <Input
                            error={Boolean(error.payload)}
                            errorText={error.payload}
                            name="variant-payload-value"
                            id="variant-payload-value"
                            label="Value"
                            multiline={payload.type !== 'string'}
                            rows={payload.type === 'string' ? 1 : 4}
                            className={themeStyles.fullWidth}
                            value={payload.value}
                            onChange={e => onPayload('value')(e.target.value)}
                            data-testid={'VARIANT_PAYLOAD_VALUE'}
                            placeholder={
                                payload.type === 'json'
                                    ? '{ "hello": "world" }'
                                    : ''
                            }
                        />
                    </Grid>
                </Grid>
                <ConditionallyRender
                    condition={overrides.length > 0}
                    show={
                        <p className={styles.label}>
                            <strong>Overrides </strong>
                            <HelpIcon tooltip="Here you can specify which users should get this variant." />
                        </p>
                    }
                />
                <OverrideConfig
                    overrides={overrides}
                    overridesDispatch={overridesDispatch}
                />
                <Button
                    onClick={onAddOverride}
                    variant="contained"
                    color="primary"
                >
                    Add override
                </Button>
            </form>
        </Dialogue>
    );
};
