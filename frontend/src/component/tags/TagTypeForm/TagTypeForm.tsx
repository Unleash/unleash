import Input from 'component/common/Input/Input';
import { TextField, Button, styled } from '@mui/material';

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

const StyledForm = styled('form')(({ theme }) => ({
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

const StyledTextField = styled(TextField)(({ theme }) => ({
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
    return (
        <StyledForm onSubmit={handleSubmit}>
            <StyledContainer>
                <StyledInputDescription>
                    What is your tag name?
                </StyledInputDescription>
                <StyledInput
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

                <StyledInputDescription>
                    What is this tag for?
                </StyledInputDescription>
                <StyledTextField
                    label="Tag description"
                    variant="outlined"
                    multiline
                    maxRows={4}
                    value={tagDesc}
                    onChange={e => setTagDesc(e.target.value)}
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

export default TagTypeForm;
