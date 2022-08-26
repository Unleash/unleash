import { Button } from '@mui/material';
import { useStyles } from './EnvironmentForm.styles';
import React from 'react';
import Input from 'component/common/Input/Input';
import EnvironmentTypeSelector from './EnvironmentTypeSelector/EnvironmentTypeSelector';
import { trim } from 'component/common/util';

interface IEnvironmentForm {
    name: string;
    type: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setType: React.Dispatch<React.SetStateAction<string>>;
    validateEnvironmentName?: (e: any) => void;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
}

const EnvironmentForm: React.FC<IEnvironmentForm> = ({
    children,
    handleSubmit,
    handleCancel,
    name,
    type,
    setName,
    setType,
    validateEnvironmentName,
    errors,
    mode,
    clearErrors,
}) => {
    const { classes: styles } = useStyles();

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3 className={styles.formHeader}>Environment information</h3>

            <div className={styles.container}>
                <p className={styles.inputDescription}>
                    What is your environment name? (Can't be changed later)
                </p>
                <Input
                    className={styles.input}
                    label="Environment name"
                    value={name}
                    onChange={e => setName(trim(e.target.value))}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors()}
                    onBlur={validateEnvironmentName}
                    disabled={mode === 'Edit'}
                    autoFocus
                />

                <p className={styles.inputDescription}>
                    What type of environment do you want to create?
                </p>
                <EnvironmentTypeSelector
                    onChange={e => setType(e.currentTarget.value)}
                    value={type}
                />
            </div>
            <div className={styles.buttonContainer}>
                {children}
                <Button onClick={handleCancel} className={styles.cancelButton}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default EnvironmentForm;
