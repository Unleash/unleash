import Input from '../../common/Input/Input';
import { TextField, Button } from '@material-ui/core';

import { useStyles } from './TagTypeForm.styles';
import React from 'react';
import { trim } from '../../common/util';
import { EDIT } from '../../../constants/misc';

interface ITagTypeForm {
    tagName: string;
    tagDesc: string;
    setTagName: React.Dispatch<React.SetStateAction<string>>;
    setTagDesc: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: string;
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
    const styles = useStyles();

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3 className={styles.formHeader}>Tag information</h3>

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
