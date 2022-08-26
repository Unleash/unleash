import Input from 'component/common/Input/Input';
import { TextField, Button } from '@mui/material';

import { useStyles } from './TagTypeForm.styles';
import React from 'react';
import { trim } from 'component/common/util';
import { EDIT } from 'constants/misc';

interface ITagTypeForm {
    tagName: string;
    tagDesc: string;
    setTagName: React.Dispatch<React.SetStateAction<string>>;
    setTagDesc: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
    validateNameUniqueness?: () => void;
}

const TagTypeForm: React.FC<ITagTypeForm> = ({
    children,
    handleSubmit,
    handleCancel,
    tagName,
    tagDesc,
    setTagName,
    setTagDesc,
    errors,
    mode,
    validateNameUniqueness,
    clearErrors,
}) => {
    const { classes: styles } = useStyles();

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.container}>
                <p className={styles.inputDescription}>
                    What is your tag name?
                </p>
                <Input
                    className={styles.input}
                    label="Tag name"
                    value={tagName}
                    onChange={e => setTagName(trim(e.target.value))}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors()}
                    disabled={mode === EDIT}
                    onBlur={validateNameUniqueness}
                    autoFocus
                />

                <p className={styles.inputDescription}>What is this tag for?</p>
                <TextField
                    className={styles.input}
                    label="Tag description"
                    variant="outlined"
                    multiline
                    maxRows={4}
                    value={tagDesc}
                    onChange={e => setTagDesc(e.target.value)}
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

export default TagTypeForm;
