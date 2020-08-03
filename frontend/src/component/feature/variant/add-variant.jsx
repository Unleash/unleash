import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { Button, Textfield, DialogActions, Grid, Cell, Icon, Switch } from 'react-mdl';
import styles from './variant.scss';
import MySelect from '../../common/select';
import { trim } from '../form/util';
import { weightTypes } from './enums';
import OverrideConfig from './override-config';

Modal.setAppElement('#app');

const customStyles = {
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        zIndex: 5,
    },
    content: {
        width: '500px',
        maxWidth: '90%',
        margin: '0',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
    },
};

const payloadOptions = [
    { key: 'string', label: 'string' },
    { key: 'json', label: 'json' },
    { key: 'csv', label: 'csv' },
];

const EMPTY_PAYLOAD = { type: 'string', value: '' };

function AddVariant({ showDialog, closeDialog, save, validateName, editVariant, title }) {
    const [data, setData] = useState({});
    const [payload, setPayload] = useState(EMPTY_PAYLOAD);
    const [overrides, setOverrides] = useState([]);
    const [error, setError] = useState({});

    const clear = () => {
        if (editVariant) {
            setData({
                name: editVariant.name,
                weight: editVariant.weight / 10,
                weightType: editVariant.weightType || weightTypes.VARIABLE,
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
            const msg = error.message || 'Could not add variant';
            setError({ general: msg });
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
        setOverrides([...overrides, ...[{ contextName: 'userId', values: [] }]]);
    };

    const isFixWeight = data.weightType === weightTypes.FIX;

    return (
        <Modal isOpen={showDialog} contentLabel="Example Modal" style={customStyles} onRequestClose={onCancel}>
            <h3>{title}</h3>

            <form onSubmit={submit}>
                <p style={{ color: 'red' }}>{error.general}</p>
                <Textfield
                    floatingLabel
                    label="Variant name"
                    name="name"
                    placeholder=""
                    style={{ width: '100%' }}
                    value={data.name}
                    error={error.name}
                    type="name"
                    onChange={setVariantValue}
                />
                <br />
                <Grid noSpacing className={styles.flex}>
                    <Cell col={3} className={styles.flex}>
                        <Textfield
                            id="weight"
                            floatingLabel
                            label="Weight"
                            name="weight"
                            placeholder=""
                            style={{ width: '40px', marginRight: '5px' }}
                            inputClassName={styles.inputWeight}
                            value={data.weight}
                            error={error.weight}
                            type="number"
                            disabled={!isFixWeight}
                            onChange={setVariantValue}
                        />
                        <span>%</span>
                    </Cell>
                    <Cell col={9} className={[styles.flexCenter, styles.marginL10]}>
                        <Switch name="weightType" checked={isFixWeight} onChange={setVariantWeightType}>
                            Custom percentage
                        </Switch>
                    </Cell>
                </Grid>
                <p style={{ marginBottom: '0' }}>
                    <strong>Payload </strong>
                    <Icon name="info" title="Passed to the variant object. Can be anything (json, value, csv)" />
                </p>
                <Grid noSpacing>
                    <Cell col={3}>
                        <MySelect
                            name="type"
                            label="Type"
                            style={{ width: '100%' }}
                            value={payload.type}
                            options={payloadOptions}
                            onChange={onPayload}
                        />
                    </Cell>
                    <Cell col={9}>
                        <Textfield
                            floatingLabel
                            rows={1}
                            label="Value"
                            name="value"
                            style={{ width: '100%' }}
                            value={payload.value}
                            onChange={onPayload}
                        />
                    </Cell>
                </Grid>
                {overrides.length > 0 && (
                    <p style={{ marginBottom: '0' }}>
                        <strong>Overrides </strong>
                        <Icon name="info" title="Here you can specify which users that should get this variant." />
                    </p>
                )}

                <OverrideConfig
                    overrides={overrides}
                    removeOverride={removeOverride}
                    updateOverrideType={updateOverrideType}
                    updateOverrideValues={updateOverrideValues}
                    updateValues={updateOverrideValues}
                />
                <a href="#add-override" onClick={onAddOverride}>
                    <small>Add override</small>
                </a>
                <DialogActions>
                    <Button type="button" raised colored type="submit">
                        Save
                    </Button>
                    <Button type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Modal>
    );
}

AddVariant.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    validateName: PropTypes.func.isRequired,
    editVariant: PropTypes.object,
    title: PropTypes.string,
};

export default AddVariant;
