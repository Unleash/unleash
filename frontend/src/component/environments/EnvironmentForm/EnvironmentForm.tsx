import { Box, Button, styled } from '@mui/material';
import type React from 'react';
import Input from 'component/common/Input/Input';
import { EnvironmentTypeSelector } from './EnvironmentTypeSelector.tsx';
import { ChangeRequestSelector } from './ChangeRequestSelector.tsx';
import { trim } from 'component/common/util';

interface IEnvironmentForm {
    name: string;
    type: string;
    requiredApprovals: number | null;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setType: React.Dispatch<React.SetStateAction<string>>;
    setRequiredApprovals: React.Dispatch<React.SetStateAction<number | null>>;

    validateEnvironmentName?: (e: any) => void;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
    children?: React.ReactNode;
    Limit?: React.ReactNode;
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

const LimitContainer = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

const EnvironmentForm: React.FC<IEnvironmentForm> = ({
    children,
    handleSubmit,
    handleCancel,
    name,
    type,
    requiredApprovals,
    setName,
    setType,
    setRequiredApprovals,
    validateEnvironmentName,
    errors,
    mode,
    clearErrors,
    Limit,
}) => {
    return (
        <StyledForm onSubmit={handleSubmit}>
            <StyledFormHeader>Environment information</StyledFormHeader>

            <StyledContainer>
                <StyledInputDescription>
                    What is your environment name? (Can't be changed later)
                </StyledInputDescription>
                <StyledInput
                    label='Environment name'
                    value={name}
                    onChange={(e) => setName(trim(e.target.value))}
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
                    onChange={(e) => setType(e.currentTarget.value)}
                    value={type}
                />

                <>
                    <StyledInputDescription sx={{ mt: 2 }}>
                        Would you like to predefine change requests for this
                        environment?
                    </StyledInputDescription>
                    <ChangeRequestSelector
                        onChange={setRequiredApprovals}
                        value={requiredApprovals}
                    />
                </>
            </StyledContainer>

            <LimitContainer>{Limit}</LimitContainer>

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
