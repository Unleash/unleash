import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    FormControl,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    InputAdornment,
    Button,
} from '@material-ui/core';
import { Info } from '@material-ui/icons';
import Dialog from '../../../common/Dialogue';
import MySelect from '../../../common/select';
import { modalStyles, trim } from '../../../common/util';
import { weightTypes } from '../enums';
import OverrideConfig from './OverrideConfig/OverrideConfig';
import { useCommonStyles } from '../../../../common.styles';
import ConditionallyRender from '../../../common/ConditionallyRender';

const payloadOptions = [
    { key: 'string', label: 'string' },
    { key: 'json', label: 'json' },
    { key: 'csv', label: 'csv' },
];

const EMPTY_PAYLOAD = { type: 'string', value: '' };

const AddVariant = ({
    showDialog,
    closeDialog,
    save,
    validateName,
    editVariant,
    title,
}) => {
    const [data, setData] = useState({});
    const [payload, setPayload] = useState(EMPTY_PAYLOAD);
    const [overrides, setOverrides] = useState([]);
    const [error, setError] = useState({});
    const commonStyles = useCommonStyles();

    const clear = () => {
        if (editVariant) {
            setData({
                name: editVariant.name,
                weight: editVariant.weight / 10,
                weightType: editVariant.weightType || weightTypes.VARIABLE,
                stickiness: editVariant.stickiness
            });
            if (editVariant.payload) {
                setPayload(editVariant.payload);
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

    useEffect(() => {
        clear();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editVariant]);

    const setVariantValue = e => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: trim(value),
        });
    };

    const setVariantWeightType = e => {
        const { checked, name } = e.target;
        const weightType = checked ? weightTypes.FIX : weightTypes.VARIABLE;
        setData({
            ...data,
            [name]: weightType,
        });
    };

    const submit = async e => {
        setError({});
        e.preventDefault();

        const validationError = validateName(data.name);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            const variant = {
                name: data.name,
                weight: data.weight * 10,
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
            if (error.message.includes('duplicate value')) {
                setError({ name: 'A variant with that name already exists.' });
            } else {
                const msg = error.message || 'Could not add variant';
                setError({ general: msg });
            }
        }
    };

    const onPayload = e => {
        e.preventDefault();
        setPayload({
            ...payload,
            [e.target.name]: e.target.value,
        });
    };

    const onCancel = e => {
        e.preventDefault();
        clear();
        closeDialog();
    };

    const updateOverrideType = index => e => {
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

    const updateOverrideValues = (index, values) => {
        setOverrides(
            overrides.map((o, i) => {
                if (i === index) {
                    o.values = values;
                }
                return o;
            })
        );
    };

    const removeOverride = index => e => {
        e.preventDefault();
        setOverrides(overrides.filter((o, i) => i !== index));
    };

    const onAddOverride = e => {
        e.preventDefault();
        setOverrides([
            ...overrides,
            ...[{ contextName: 'userId', values: [] }],
        ]);
    };

    const isFixWeight = data.weightType === weightTypes.FIX;

    return (
        <Dialog
            open={showDialog}
            contentLabel="Example Modal"
            style={modalStyles}
            onClose={onCancel}
            onClick={submit}
            primaryButtonText="Save"
            secondaryButtonText="Cancel"
            title={title}
        >
            <form onSubmit={submit} className={commonStyles.contentSpacingY}>
                <p style={{ color: 'red' }}>{error.general}</p>
                <TextField
                    label="Variant name"
                    name="name"
                    placeholder=""
                    className={commonStyles.fullWidth}
                    helperText={error.name}
                    value={data.name || ''}
                    error={Boolean(error.name)}
                    variant="outlined"
                    required
                    size="small"
                    type="name"
                    onChange={setVariantValue}
                />
                <br />
                <Grid container>
                    <Grid item md={4}>
                        <TextField
                            id="weight"
                            label="Weight"
                            name="weight"
                            variant="outlined"
                            size="small"
                            placeholder=""
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="start">
                                        %
                                    </InputAdornment>
                                ),
                            }}
                            style={{ marginRight: '0.8rem' }}
                            value={data.weight || ''}
                            error={Boolean(error.weight)}
                            type="number"
                            disabled={!isFixWeight}
                            onChange={setVariantValue}
                        />
                    </Grid>
                    <Grid item md={6}>
                        <FormControl>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="weightType"
                                        value={isFixWeight}
                                        onChange={setVariantWeightType}
                                    />
                                }
                                label="Custom percentage"
                            />
                        </FormControl>
                    </Grid>
                </Grid>
                <p style={{ marginBottom: '1rem' }}>
                    <strong>Payload </strong>
                    <Info title="Passed to the variant object. Can be anything (json, value, csv)" />
                </p>
                <Grid container>
                    <Grid item md={3}>
                        <MySelect
                            name="type"
                            label="Type"
                            className={commonStyles.fullWidth}
                            value={payload.type}
                            options={payloadOptions}
                            onChange={onPayload}
                        />
                    </Grid>
                    <Grid item md={9}>
                        <TextField
                            rows={1}
                            label="Value"
                            name="value"
                            className={commonStyles.fullWidth}
                            value={payload.value}
                            onChange={onPayload}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                </Grid>
                <ConditionallyRender
                    condition={overrides.length > 0}
                    show={
                        <p style={{ marginBottom: '.5rem' }}>
                            <strong>Overrides </strong>
                            <Info title="Here you can specify which users should get this variant." />
                        </p>
                    }
                />
                <OverrideConfig
                    overrides={overrides}
                    removeOverride={removeOverride}
                    updateOverrideType={updateOverrideType}
                    updateOverrideValues={updateOverrideValues}
                    updateValues={updateOverrideValues}
                />
                <Button onClick={onAddOverride}>Add override</Button>{' '}
            </form>
        </Dialog>
    );
};

AddVariant.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    validateName: PropTypes.func.isRequired,
    editVariant: PropTypes.object,
    title: PropTypes.string,
    uiConfig: PropTypes.object,
};

export default AddVariant;
