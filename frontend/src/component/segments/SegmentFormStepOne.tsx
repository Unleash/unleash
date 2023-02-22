import { Button, styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SegmentFormStep } from './SegmentForm';
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

const StyledForm = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledContainer = styled('div')(({ theme }) => ({
    maxWidth: '400px',
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

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

    return (
        <StyledForm>
            <StyledContainer>
                <StyledInputDescription>
                    What is the segment name?
                </StyledInputDescription>
                <StyledInput
                    label="Segment name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    autoFocus
                    required
                    data-testid={SEGMENT_NAME_ID}
                />
                <StyledInputDescription>
                    What is the segment description?
                </StyledInputDescription>
                <StyledInput
                    label="Description (optional)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    error={Boolean(errors.description)}
                    errorText={errors.description}
                    data-testid={SEGMENT_DESC_ID}
                />
            </StyledContainer>
            <StyledButtonContainer>
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
                <StyledCancelButton
                    type="button"
                    onClick={() => {
                        navigate('/segments');
                    }}
                >
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </StyledForm>
    );
};
