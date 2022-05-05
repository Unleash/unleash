import { Button } from '@mui/material';
import Input from 'component/common/Input/Input';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStyles } from 'component/segments/SegmentFormStepOne/SegmentFormStepOne.styles';
import { SegmentFormStep } from '../SegmentForm/SegmentForm';
import {
    SEGMENT_NAME_ID,
    SEGMENT_DESC_ID,
    SEGMENT_NEXT_BTN_ID,
} from 'utils/testIds';

interface ISegmentFormPartOneProps {
    name: string;
    description: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    errors: { [key: string]: string };
    clearErrors: () => void;
    setCurrentStep: React.Dispatch<React.SetStateAction<SegmentFormStep>>;
}

export const SegmentFormStepOne: React.FC<ISegmentFormPartOneProps> = ({
    children,
    name,
    description,
    setName,
    setDescription,
    errors,
    clearErrors,
    setCurrentStep,
}) => {
    const navigate = useNavigate();
    const { classes: styles } = useStyles();

    return (
        <div className={styles.form}>
            <div className={styles.container}>
                <p className={styles.inputDescription}>
                    What is the segment name?
                </p>
                <Input
                    className={styles.input}
                    label="Segment name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    autoFocus
                    required
                    data-testid={SEGMENT_NAME_ID}
                />
                <p className={styles.inputDescription}>
                    What is the segment description?
                </p>
                <Input
                    className={styles.input}
                    label="Description (optional)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    error={Boolean(errors.description)}
                    errorText={errors.description}
                    data-testid={SEGMENT_DESC_ID}
                />
            </div>
            <div className={styles.buttonContainer}>
                <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={() => setCurrentStep(2)}
                    disabled={name.length === 0 || Boolean(errors.name)}
                    data-testid={SEGMENT_NEXT_BTN_ID}
                >
                    Next
                </Button>
                <Button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                        navigate('/segments');
                    }}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};
