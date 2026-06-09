import { Box, Button, styled } from '@mui/material';
import type React from 'react';
import Input from 'component/common/Input/Input';
import { FormField } from 'component/common/FormField/FormField';
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

const StyledContainer = styled('div')({
    maxWidth: '440px',
});

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
            <StyledContainer>
                <FormField
                    label='Environment name'
                    description="What is your environment name? (Can't be changed later)"
                >
                    <Input
                        fullWidth
                        label=''
                        value={name}
                        onChange={(e) => setName(trim(e.target.value))}
                        error={Boolean(errors.name)}
                        errorText={errors.name}
                        onFocus={() => clearErrors()}
                        onBlur={validateEnvironmentName}
                        disabled={mode === 'Edit'}
                        autoFocus
                    />
                </FormField>

                <FormField
                    label='Environment type'
                    description='What type of environment do you want to create?'
                >
                    <EnvironmentTypeSelector
                        onChange={(e) => setType(e.currentTarget.value)}
                        value={type}
                    />
                </FormField>

                <FormField
                    label='Change requests'
                    description='Would you like to predefine change requests for this environment?'
                >
                    <ChangeRequestSelector
                        onChange={setRequiredApprovals}
                        value={requiredApprovals}
                    />
                </FormField>
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
