import React from 'react';
import { Switch, FormControlLabel, Tooltip, TextField } from '@material-ui/core';
import strategyInputProps from './strategy-input-props';
import StrategyInputPercentage from './input-percentage';
import StrategyInputList from './input-list';
import styles from '../strategy.module.scss';

export default function GeneralStrategyInput({ parameters, strategyDefinition, updateParameter, editable }) {
    const onChangeTextField = (field, evt) => {
        const { value } = evt.currentTarget;

        evt.preventDefault();
        updateParameter(field, value);
    };

    const onChangePercentage = (field, evt, newValue) => {
        evt.preventDefault();
        updateParameter(field, newValue);
    };

    const handleSwitchChange = (key, currentValue) => {
        const value = currentValue === 'true' ? 'false' : 'true';
        updateParameter(key, value);
    };

    if (strategyDefinition.parameters && strategyDefinition.parameters.length > 0) {
        return strategyDefinition.parameters.map(({ name, type, description, required }) => {
            let value = parameters[name];

            if (type === 'percentage') {
                if (value == null || (typeof value === 'string' && value === '')) {
                    value = 0;
                }
                return (
                    <div key={name}>
                        <br />
                        <StrategyInputPercentage
                            name={name}
                            onChange={onChangePercentage.bind(this, name)}
                            value={1 * value}
                            minLabel="off"
                            maxLabel="on"
                        />
                        {description && (
                            <p className={styles.helpText} className={styles.helperText}>
                                {description}
                            </p>
                        )}
                    </div>
                );
            } else if (type === 'list') {
                let list = [];
                if (typeof value === 'string') {
                    list = value
                        .trim()
                        .split(',')
                        .filter(Boolean);
                }
                return (
                    <div key={name}>
                        <StrategyInputList name={name} list={list} disabled={!editable} setConfig={updateParameter} />
                        {description && <p className={styles.helpText}>{description}</p>}
                    </div>
                );
            } else if (type === 'number') {
                const regex = new RegExp('^\\d+$');
                const error = value.length > 0 ? !regex.test(value) : false;

                return (
                    <div key={name} className={styles.generalSection}>
                        <TextField
                            error={error !== undefined}
                            helperText={error && `${name} is not a number!`}
                            variant="outlined"
                            size="small"
                            required={required}
                            style={{ width: '100%' }}
                            name={name}
                            label={name}
                            onChange={onChangeTextField.bind(this, name)}
                            value={value}
                        />
                        {description && <p className={styles.helpText}>{description}</p>}
                    </div>
                );
            } else if (type === 'boolean') {
                return (
                    <div key={name} style={{ padding: '20px 0' }}>
                        <Tooltip title={description} placement="right-end">
                            <FormControlLabel
                                label={name}
                                control={
                                    <Switch
                                        name={name}
                                        onChange={handleSwitchChange.bind(this, name, value)}
                                        checked={value === 'true'}
                                    />
                                }
                            />
                        </Tooltip>
                    </div>
                );
            } else {
                return (
                    <div key={name} className={styles.generalSection}>
                        <TextField
                            rows={1}
                            placeholder=""
                            variant="outlined"
                            size="small"
                            style={{ width: '100%' }}
                            required={required}
                            name={name}
                            label={name}
                            onChange={onChangeTextField.bind(this, name)}
                            value={value}
                        />
                        {description && <p className={styles.helpText}>{description}</p>}
                    </div>
                );
            }
        });
    }
    return null;
}

GeneralStrategyInput.propTypes = strategyInputProps;
