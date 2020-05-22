import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Textfield,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Cell,
    Tooltip,
    Icon,
} from 'react-mdl';
import MySelect from '../../common/select';
import { trim } from '../form/util';
import styles from './variant.scss';
import OverrideConfig from './override-config';

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
            setData({ name: editVariant.name });
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

    const setName = e => {
        setData({
            ...data,
            [e.target.name]: trim(e.target.value),
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
            const msg = error.error || 'Could not add variant';
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

    return (
        <form onSubmit={submit}>
            <Dialog open={showDialog} className={styles.modal}>
                <DialogTitle style={{ padding: '10px' }}>{title}</DialogTitle>

                <DialogContent style={{ minHeight: '350px', padding: '10px' }}>
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
                        onChange={setName}
                    />
                    <br />
                    <br />
                    <Tooltip
                        className={styles.tooltip}
                        label={
                            <span>
                                Passed to the variant object. <br />
                                Can be anything (json, value, csv)
                            </span>
                        }
                    >
                        <p style={{ marginBottom: '0' }}>
                            <strong>Payload </strong>
                            <Icon name="info" />
                        </p>
                    </Tooltip>
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
                    {overrides.length > 0 ? (
                        <Tooltip
                            className={styles.tooltip}
                            label={
                                <div>
                                    Here you can specify which users that <br />
                                    should get this variant.
                                </div>
                            }
                        >
                            <p style={{ marginBottom: '0' }}>
                                <strong>Overrides </strong>
                                <Icon name="info" />
                            </p>
                        </Tooltip>
                    ) : (
                        undefined
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
                </DialogContent>
                <DialogActions>
                    <Button type="button" raised colored type="submit">
                        Save
                    </Button>
                    <Button type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </form>
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
