import Input from 'component/common/Input/Input';
import { Button, styled } from '@mui/material';
import { TagTypeColorPicker } from './TagTypeColorPicker.tsx';
import { FormField } from 'component/common/FormField/FormField';
import type React from 'react';
import { trim } from 'component/common/util';
import { EDIT } from 'constants/misc';

interface ITagTypeForm {
    tagName: string;
    tagDesc: string;
    color: string;
    setTagName: React.Dispatch<React.SetStateAction<string>>;
    setTagDesc: React.Dispatch<React.SetStateAction<string>>;
    setColor: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
    validateNameUniqueness?: () => void;
    children?: React.ReactNode;
}

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledContainer = styled('div')(({ theme }) => ({
    maxWidth: '400px',
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
    color,
    setTagName,
    setTagDesc,
    setColor,
    errors,
    mode,
    validateNameUniqueness,
    clearErrors,
}) => {
    return (
        <StyledForm onSubmit={handleSubmit}>
            <StyledContainer>
                <FormField
                    label='Tag name'
                    description='What is your tag name?'
                >
                    <Input
                        fullWidth
                        label=''
                        value={tagName}
                        onChange={(e) => setTagName(trim(e.target.value))}
                        error={Boolean(errors.name)}
                        errorText={errors.name}
                        onFocus={() => clearErrors()}
                        disabled={mode === EDIT}
                        onBlur={validateNameUniqueness}
                        autoFocus
                    />
                </FormField>

                <FormField
                    label='Tag description'
                    description='What is this tag for?'
                >
                    <Input
                        fullWidth
                        label=''
                        multiline
                        maxRows={4}
                        value={tagDesc}
                        onChange={(e) => setTagDesc(e.target.value)}
                    />
                </FormField>

                <FormField label='Tag color'>
                    <TagTypeColorPicker
                        selectedColor={color}
                        onChange={setColor}
                    />
                </FormField>
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
