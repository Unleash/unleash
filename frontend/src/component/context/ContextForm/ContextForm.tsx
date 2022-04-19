import Input from 'component/common/Input/Input';
import { TextField, Button, Switch, Typography } from '@material-ui/core';
import { useStyles } from './ContextForm.styles';
import React, { useState, useEffect } from 'react';
import { Add } from '@material-ui/icons';
import { ILegalValue } from 'interfaces/context';
import { ContextFormChip } from 'component/context/ContectFormChip/ContextFormChip';
import { ContextFormChipList } from 'component/context/ContectFormChip/ContextFormChipList';

interface IContextForm {
    contextName: string;
    contextDesc: string;
    legalValues: ILegalValue[];
    stickiness: boolean;
    setContextName: React.Dispatch<React.SetStateAction<string>>;
    setContextDesc: React.Dispatch<React.SetStateAction<string>>;
    setStickiness: React.Dispatch<React.SetStateAction<boolean>>;
    setLegalValues: React.Dispatch<React.SetStateAction<ILegalValue[]>>;
    handleSubmit: (e: any) => void;
    onCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: (key?: string) => void;
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
    const [valueDesc, setValueDesc] = useState('');
    const [valueFocused, setValueFocused] = useState(false);

    const isMissingValue = valueDesc.trim() && !value.trim();

    const isDuplicateValue = legalValues.some(legalValue => {
        return legalValue.value.trim() === value.trim();
    });

    useEffect(() => {
        setErrors(prev => ({
            ...prev,
            tag: isMissingValue
                ? 'Value cannot be empty'
                : isDuplicateValue
                ? 'Duplicate value'
                : undefined,
        }));
    }, [setErrors, isMissingValue, isDuplicateValue]);

    const onSubmit = (event: React.SyntheticEvent) => {
        event.preventDefault();
        handleSubmit(event);
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === ENTER) {
            event.preventDefault();
            if (valueFocused) {
                addLegalValue();
            } else {
                handleSubmit(event);
            }
        }
    };

    const sortLegalValues = (a: ILegalValue, b: ILegalValue) => {
        return a.value.toLowerCase().localeCompare(b.value.toLowerCase());
    };

    const addLegalValue = () => {
        const next: ILegalValue = {
            value: value.trim(),
            description: valueDesc.trim(),
        };
        if (next.value && !isDuplicateValue) {
            setValue('');
            setValueDesc('');
            setLegalValues(prev => [...prev, next].sort(sortLegalValues));
        }
    };

    const removeLegalValue = (value: ILegalValue) => {
        setLegalValues(prev => prev.filter(p => p.value !== value.value));
    };

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.container}>
                <p className={styles.inputDescription}>
                    What is your context name?
                </p>
                <Input
                    className={styles.input}
                    label="Context name"
                    value={contextName}
                    disabled={mode === 'Edit'}
                    onChange={e => setContextName(e.target.value.trim())}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors('name')}
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
                    size="small"
                    onChange={e => setContextDesc(e.target.value)}
                />
                <p className={styles.inputDescription}>
                    Which values do you want to allow?
                </p>
                <div className={styles.tagContainer}>
                    <TextField
                        label="Legal value (optional)"
                        name="value"
                        className={styles.tagInput}
                        value={value}
                        error={Boolean(errors.tag)}
                        helperText={errors.tag}
                        variant="outlined"
                        size="small"
                        onChange={e => setValue(e.target.value)}
                        onKeyPress={e => onKeyDown(e)}
                        onBlur={() => setValueFocused(false)}
                        onFocus={() => setValueFocused(true)}
                        inputProps={{ maxLength: 100 }}
                    />
                    <TextField
                        label="Value description (optional)"
                        className={styles.tagInput}
                        value={valueDesc}
                        variant="outlined"
                        size="small"
                        onChange={e => setValueDesc(e.target.value)}
                        onKeyPress={e => onKeyDown(e)}
                        onBlur={() => setValueFocused(false)}
                        onFocus={() => setValueFocused(true)}
                        inputProps={{ maxLength: 100 }}
                    />
                    <Button
                        className={styles.tagButton}
                        startIcon={<Add />}
                        onClick={addLegalValue}
                        variant="outlined"
                        color="primary"
                        disabled={!value.trim() || isDuplicateValue}
                    >
                        Add
                    </Button>
                </div>
                <ContextFormChipList>
                    {legalValues.map(legalValue => {
                        return (
                            <ContextFormChip
                                key={legalValue.value}
                                label={legalValue.value}
                                description={legalValue.description}
                                onRemove={() => removeLegalValue(legalValue)}
                            />
                        );
                    })}
                </ContextFormChipList>
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
