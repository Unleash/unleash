import React, { useEffect, useState, ChangeEvent } from 'react';
import {
    Button,
    FormControl,
    FormControlLabel,
    Grid,
    InputAdornment,
    TextField,
    Tooltip,
} from '@material-ui/core';
import { Info } from '@material-ui/icons';
import { weightTypes } from './enums';
import { OverrideConfig } from './OverrideConfig/OverrideConfig';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import { useCommonStyles } from 'common.styles';
import Dialogue from '../../../../../common/Dialogue';
import { modalStyles, trim } from 'component/common/util';
import PermissionSwitch from '../../../../../common/PermissionSwitch/PermissionSwitch';
import { UPDATE_FEATURE_VARIANTS } from 'component/providers/AccessProvider/permissions';
import useFeature from '../../../../../../hooks/api/getters/useFeature/useFeature';
import { useParams } from 'react-router-dom';
import { IFeatureViewParams } from 'interfaces/params';
import { IFeatureVariant, IOverride } from 'interfaces/featureToggle';
import cloneDeep from 'lodash.clonedeep';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';

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

const AddVariant = ({
    showDialog,
    closeDialog,
    save,
    editVariant,
    validateName,
    validateWeight,
    title,
    editing,
}: IAddVariantProps) => {
    const [data, setData] = useState<Record<string, string>>({});
    const [payload, setPayload] = useState(EMPTY_PAYLOAD);
    const [overrides, setOverrides] = useState<IOverride[]>([]);
    const [error, setError] = useState<Record<string, string>>({});
    const commonStyles = useCommonStyles();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);
    const [variants, setVariants] = useState<IFeatureVariant[]>([]);

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
                setOverrides(editVariant.overrides);
            } else {
                setOverrides([]);
            }
        } else {
            setData({});
            setPayload(EMPTY_PAYLOAD);
            setOverrides([]);
        }
        setError({});
    };

    const setClonedVariants = (clonedVariants: IFeatureVariant[]) =>
        setVariants(cloneDeep(clonedVariants));

    useEffect(() => {
        if (feature) {
            setClonedVariants(feature.variants);
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [feature.variants]);

    useEffect(() => {
        clear();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editVariant]);

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
        } catch (error) {
            if (error?.body?.details[0]?.message?.includes('duplicate value')) {
                setError({ name: 'A variant with that name already exists.' });
            } else if (
                error?.body?.details[0]?.message?.includes('must be a number')
            ) {
                setError({ weight: 'Weight must be a number' });
            } else {
                const msg =
                    error?.body?.details[0]?.message || 'Could not add variant';
                setError({ general: msg });
            }
        }
    };

    const onPayload = (e: ChangeEvent<{ name?: string; value: unknown }>) => {
        e.preventDefault();
        setPayload({
            ...payload,
            [e.target.name]: e.target.value,
        });
    };

    const onCancel = (e: React.SyntheticEvent) => {
        e.preventDefault();
        clear();
        closeDialog();
    };

    const updateOverrideType =
        (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            setOverrides(
                overrides.map((o, i) => {
                    if (i === index) {
                        o[e.target.name] = e.target.value;
                    }

                    return o;
                })
            );
        };

    const updateOverrideValues = (index: number, values: string[]) => {
        setOverrides(
            overrides.map((o, i) => {
                if (i === index) {
                    o.values = values;
                }
                return o;
            })
        );
    };

    const removeOverride = (index: number) => (e: React.SyntheticEvent) => {
        e.preventDefault();
        setOverrides(overrides.filter((o, i) => i !== index));
    };

    const onAddOverride = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setOverrides([
            ...overrides,
            ...[{ contextName: 'userId', values: [] }],
        ]);
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
                className={commonStyles.contentSpacingY}
            >
                <p style={{ color: 'red' }}>{error.general}</p>
                <TextField
                    label="Variant name"
                    autoFocus
                    name="name"
                    placeholder=""
                    className={commonStyles.fullWidth}
                    style={{ maxWidth: '350px' }}
                    helperText={error.name}
                    value={data.name || ''}
                    error={Boolean(error.name)}
                    variant="outlined"
                    required
                    size="small"
                    type="name"
                    disabled={editing}
                    onChange={setVariantValue}
                    data-test={'VARIANT_NAME_INPUT'}
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
                            <Grid
                                item
                                md={12}
                                style={{ marginBottom: '0.5rem' }}
                            >
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
                                                data-test={
                                                    'VARIANT_WEIGHT_TYPE'
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
                                <TextField
                                    id="weight"
                                    label="Weight"
                                    name="weight"
                                    variant="outlined"
                                    size="small"
                                    placeholder=""
                                    data-test={'VARIANT_WEIGHT_INPUT'}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="start">
                                                %
                                            </InputAdornment>
                                        ),
                                    }}
                                    style={{ marginRight: '0.8rem' }}
                                    value={data.weight}
                                    error={Boolean(error.weight)}
                                    helperText={error.weight}
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
                <p style={{ marginBottom: '1rem' }}>
                    <strong>Payload </strong>
                    <Tooltip
                        title="Passed to the variant object. Can be anything
                        (json, value, csv)"
                    >
                        <Info
                            style={{
                                width: '18.5px',
                                height: '18.5px',
                                color: 'grey',
                            }}
                        />
                    </Tooltip>
                </p>
                <Grid container>
                    <Grid item md={2} sm={2} xs={4}>
                        <GeneralSelect
                            id="variant-payload-type"
                            name="type"
                            label="Type"
                            className={commonStyles.fullWidth}
                            value={payload.type}
                            options={payloadOptions}
                            onChange={onPayload}
                            style={{ minWidth: '100px', width: '100%' }}
                        />
                    </Grid>
                    <Grid item md={8} sm={8} xs={6}>
                        <TextField
                            rows={1}
                            label="Value"
                            name="value"
                            className={commonStyles.fullWidth}
                            value={payload.value}
                            onChange={onPayload}
                            variant="outlined"
                            size="small"
                            data-test={'VARIANT_PAYLOAD_VALUE'}
                        />
                    </Grid>
                </Grid>
                <ConditionallyRender
                    condition={overrides.length > 0}
                    show={
                        <p style={{ marginBottom: '1rem' }}>
                            <strong>Overrides </strong>
                            <Tooltip title="Here you can specify which users should get this variant.">
                                <Info
                                    style={{
                                        width: '18.5px',
                                        height: '18.5px',
                                        color: 'grey',
                                    }}
                                />
                            </Tooltip>
                        </p>
                    }
                />
                <OverrideConfig
                    overrides={overrides}
                    removeOverride={removeOverride}
                    updateOverrideType={updateOverrideType}
                    updateOverrideValues={updateOverrideValues}
                />
                <Button
                    onClick={onAddOverride}
                    variant="contained"
                    color="primary"
                >
                    Add override
                </Button>{' '}
            </form>
        </Dialogue>
    );
};

export default AddVariant;
