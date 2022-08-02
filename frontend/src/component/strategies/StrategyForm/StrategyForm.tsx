import Input from 'component/common/Input/Input';
import { Button } from '@mui/material';
import { useStyles } from './StrategyForm.styles';
import { Add } from '@mui/icons-material';
import { trim } from 'component/common/util';
import { StrategyParameters } from './StrategyParameters/StrategyParameters';
import { IStrategyParameter } from 'interfaces/strategy';
import React from 'react';

interface IStrategyFormProps {
    strategyName: string;
    strategyDesc: string;
    params: IStrategyParameter[];
    setStrategyName: React.Dispatch<React.SetStateAction<string>>;
    validateStrategyName?: () => void;
    setStrategyDesc: React.Dispatch<React.SetStateAction<string>>;
    setParams: React.Dispatch<React.SetStateAction<IStrategyParameter[]>>;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const StrategyForm: React.FC<IStrategyFormProps> = ({
    children,
    handleSubmit,
    handleCancel,
    strategyName,
    strategyDesc,
    params,
    setParams,
    setStrategyName,
    validateStrategyName,
    setStrategyDesc,
    errors,
    mode,
    clearErrors,
}) => {
    const { classes: styles } = useStyles();
    const updateParameter = (index: number, updated: object) => {
        let item = { ...params[index] };
        params[index] = Object.assign({}, item, updated);
        setParams(prev => [...prev]);
    };

    const appParameter = () => {
        setParams(prev => [
            ...prev,
            { name: '', type: 'string', description: '', required: false },
        ]);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.container}>
                <p className={styles.inputDescription}>
                    What would you like to call your strategy?
                </p>
                <Input
                    disabled={mode === 'Edit'}
                    autoFocus
                    className={styles.input}
                    label="Strategy name*"
                    value={strategyName}
                    onChange={e => setStrategyName(trim(e.target.value))}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={clearErrors}
                    onBlur={validateStrategyName}
                />
                <p className={styles.inputDescription}>
                    What is your strategy description?
                </p>
                <Input
                    className={styles.input}
                    label="Strategy description"
                    value={strategyDesc}
                    onChange={e => setStrategyDesc(e.target.value)}
                    rows={2}
                    multiline
                />

                <StrategyParameters
                    input={params}
                    updateParameter={updateParameter}
                    setParams={setParams}
                    errors={errors}
                />
                <Button
                    onClick={e => {
                        e.preventDefault();
                        appParameter();
                    }}
                    variant="outlined"
                    color="secondary"
                    className={styles.paramButton}
                    startIcon={<Add />}
                >
                    Add parameter
                </Button>
            </div>
            <div className={styles.buttonContainer}>
                {children}
                <Button
                    type="button"
                    onClick={handleCancel}
                    className={styles.cancelButton}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};
