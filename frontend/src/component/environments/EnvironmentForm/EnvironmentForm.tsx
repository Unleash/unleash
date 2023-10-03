import { Button, styled } from '@mui/material';
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

const StyledForm = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

const StyledFormHeader = styled('h3')({
    fontWeight: 'normal',
    marginTop: '0',
});

const StyledContainer = styled('div')({
    maxWidth: '440px',
});

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
    return (
        <StyledForm onSubmit={handleSubmit}>
            <StyledFormHeader>Environment information</StyledFormHeader>

            <StyledContainer>
                <StyledInputDescription>
                    What is your environment name? (Can't be changed later)
                </StyledInputDescription>
                <StyledInput
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

                <StyledInputDescription>
                    What type of environment do you want to create?
                </StyledInputDescription>
                <EnvironmentTypeSelector
                    onChange={e => setType(e.currentTarget.value)}
                    value={type}
                />
            </StyledContainer>
            <StyledButtonContainer>
                {children}
                <StyledCancelButton onClick={handleCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </StyledForm>
    );
};

export default EnvironmentForm;
