import Input from 'component/common/Input/Input';
import { Button, styled } from '@mui/material';
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

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledContainer = styled('div')(({ theme }) => ({
    maxWidth: 400,
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

const StyledParamButton = styled(Button)(({ theme }) => ({
    color: theme.palette.primary.dark,
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

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
        <StyledForm onSubmit={handleSubmit}>
            <StyledContainer>
                <StyledInputDescription>
                    What would you like to call your strategy?
                </StyledInputDescription>
                <StyledInput
                    disabled={mode === 'Edit'}
                    autoFocus
                    label="Strategy name*"
                    value={strategyName}
                    onChange={e => setStrategyName(trim(e.target.value))}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={clearErrors}
                    onBlur={validateStrategyName}
                />
                <StyledInputDescription>
                    What is your strategy description?
                </StyledInputDescription>
                <StyledInput
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
                <StyledParamButton
                    onClick={e => {
                        e.preventDefault();
                        appParameter();
                    }}
                    variant="outlined"
                    color="secondary"
                    startIcon={<Add />}
                >
                    Add parameter
                </StyledParamButton>
            </StyledContainer>
            <StyledButtonContainer>
                {children}
                <StyledCancelButton type="button" onClick={handleCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </StyledForm>
    );
};
