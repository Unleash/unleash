import Input from 'component/common/Input/Input';
import { TextField, Button, Switch, Chip, Typography } from '@material-ui/core';
import { useStyles } from './ContextForm.styles';
import React, { useState } from 'react';
import { Add } from '@material-ui/icons';
import { trim } from 'component/common/util';

interface IContextForm {
    contextName: string;
    contextDesc: string;
    legalValues: Array<string>;
    stickiness: boolean;
    setContextName: React.Dispatch<React.SetStateAction<string>>;
    setContextDesc: React.Dispatch<React.SetStateAction<string>>;
    setStickiness: React.Dispatch<React.SetStateAction<boolean>>;
    setLegalValues: React.Dispatch<React.SetStateAction<string[]>>;
    handleSubmit: (e: any) => void;
    onCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
    validateContext?: () => void;
    setErrors: React.Dispatch<React.SetStateAction<Object>>;
}

const ENTER = 'Enter';

export const ContextForm: React.FC<IContextForm> = ({
    children,
    handleSubmit,
    onCancel,
    contextName,
    contextDesc,
    legalValues,
    stickiness,
    setContextName,
    setContextDesc,
    setLegalValues,
    setStickiness,
    errors,
    mode,
    validateContext,
    setErrors,
    clearErrors,
}) => {
    const styles = useStyles();
    const [value, setValue] = useState('');
    const [focused, setFocused] = useState(false);

    const submit = (event: React.SyntheticEvent) => {
        event.preventDefault();
        if (focused) return;
        handleSubmit(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === ENTER && focused) {
            addLegalValue();
            return;
        } else if (event.key === ENTER) {
            handleSubmit(event);
        }
    };

    const sortIgnoreCase = (a: string, b: string) => {
        a = a.toLowerCase();
        b = b.toLowerCase();
        if (a === b) return 0;
        if (a > b) return 1;
        return -1;
    };

    const addLegalValue = () => {
        clearErrors();
        if (!value) {
            return;
        }

        if (legalValues.indexOf(value) !== -1) {
            setErrors(prev => ({
                ...prev,
                tag: 'Duplicate legal value',
            }));
            return;
        }
        setLegalValues(prev => [...prev, trim(value)].sort(sortIgnoreCase));
        setValue('');
    };
    const removeLegalValue = (index: number) => {
        const filteredValues = legalValues.filter((_, i) => i !== index);
        setLegalValues([...filteredValues]);
    };

    return (
        <form onSubmit={submit} className={styles.form}>
            <h3 className={styles.formHeader}>Context information</h3>

            <div className={styles.container}>
                <p className={styles.inputDescription}>
                    What is your context name?
                </p>
                <Input
                    className={styles.input}
                    label="Context name"
                    value={contextName}
                    disabled={mode === 'Edit'}
                    onChange={e => setContextName(trim(e.target.value))}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors()}
                    onBlur={validateContext}
                    autoFocus
                />
                <p className={styles.inputDescription}>
                    What is this context for?
                </p>
                <TextField
                    className={styles.input}
                    label="Context description (optional)"
                    variant="outlined"
                    multiline
                    maxRows={4}
                    value={contextDesc}
                    onChange={e => setContextDesc(e.target.value)}
                />
                <p className={styles.inputDescription}>
                    Which values do you want to allow?
                </p>
                {legalValues.map((value, index) => {
                    return (
                        <Chip
                            key={index + value}
                            label={value}
                            className={styles.tagValue}
                            onDelete={() => removeLegalValue(index)}
                            title="Remove value"
                        />
                    );
                })}
                <div className={styles.tagContainer}>
                    <TextField
                        label="Value (optional)"
                        name="value"
                        className={styles.tagInput}
                        value={value}
                        error={Boolean(errors.tag)}
                        helperText={errors.tag}
                        variant="outlined"
                        size="small"
                        onChange={e => setValue(trim(e.target.value))}
                        onKeyPress={e => handleKeyDown(e)}
                        onBlur={e => setFocused(false)}
                        onFocus={e => setFocused(true)}
                    />
                    <Button
                        startIcon={<Add />}
                        onClick={addLegalValue}
                        variant="contained"
                        color="primary"
                    >
                        Add
                    </Button>
                </div>
                <p className={styles.inputHeader}>Custom stickiness</p>
                <p>
                    By enabling stickiness on this context field you can use it
                    together with the flexible-rollout strategy. This will
                    guarantee a consistent behavior for specific values of this
                    context field. PS! Not all client SDK's support this feature
                    yet!{' '}
                    <a
                        href="https://docs.getunleash.io/advanced/stickiness"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Read more
                    </a>
                </p>
                <div className={styles.switchContainer}>
                    <Switch
                        checked={stickiness}
                        value={stickiness}
                        onChange={() => setStickiness(!stickiness)}
                    />
                    <Typography>{stickiness ? 'On' : 'Off'}</Typography>
                </div>
            </div>
            <div className={styles.buttonContainer}>
                {children}
                <Button onClick={onCancel} className={styles.cancelButton}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};
