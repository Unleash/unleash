import type { FormEventHandler } from 'react';
import theme from 'themes/theme';
import {
    ConfigButtons,
    ProjectDescriptionContainer,
    ProjectNameContainer,
    StyledForm,
    StyledHeader,
    StyledInput,
    TopGrid,
    LimitContainer,
    FormActions,
    styleIcon,
} from './DialogFormTemplate.styles';
import { Button } from '@mui/material';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import type { IPermissionButtonProps } from 'component/common/PermissionButton/PermissionButton';

type FormProps = {
    createButtonProps: IPermissionButtonProps;
    description: string;
    errors: { [key: string]: string };
    handleSubmit: FormEventHandler<HTMLFormElement>;
    icon: React.ComponentType;
    Limit?: React.ReactNode;
    name: string;
    onClose: () => void;
    configButtons: React.ReactNode;
    resource: string;
    setDescription: (newDescription: string) => void;
    setName: (newName: string) => void;
    validateName?: () => void;
};

export const DialogFormTemplate: React.FC<FormProps> = ({
    Limit,
    handleSubmit,
    name,
    setName,
    description,
    setDescription,
    errors,
    icon,
    resource,
    onClose,
    configButtons,
    createButtonProps,
    validateName = () => {},
}) => {
    const StyledIcon = styleIcon(icon);

    return (
        <StyledForm onSubmit={handleSubmit}>
            <TopGrid>
                <StyledIcon aria-hidden='true' />
                <StyledHeader variant='h2'>Create {resource}</StyledHeader>
                <ProjectNameContainer>
                    <StyledInput
                        label={`${resource} name`}
                        aria-required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={Boolean(errors.name)}
                        errorText={errors.name}
                        onBlur={validateName}
                        onFocus={() => {
                            delete errors.name;
                        }}
                        autoFocus
                        InputProps={{
                            style: { fontSize: theme.typography.h1.fontSize },
                        }}
                        InputLabelProps={{
                            style: { fontSize: theme.typography.h1.fontSize },
                        }}
                        data-testid='FORM_NAME_INPUT'
                        size='medium'
                    />
                </ProjectNameContainer>
                <ProjectDescriptionContainer>
                    <StyledInput
                        size='medium'
                        className='description'
                        label='Description (optional)'
                        multiline
                        maxRows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        InputProps={{
                            style: { fontSize: theme.typography.h2.fontSize },
                        }}
                        InputLabelProps={{
                            style: { fontSize: theme.typography.h2.fontSize },
                        }}
                        data-testid='FORM_DESCRIPTION_INPUT'
                    />
                </ProjectDescriptionContainer>
            </TopGrid>

            <ConfigButtons>{configButtons}</ConfigButtons>

            <LimitContainer>{Limit}</LimitContainer>
            <FormActions>
                <Button onClick={onClose}>Cancel</Button>
                <CreateButton
                    data-testid='FORM_CREATE_BUTTON'
                    name={resource}
                    {...createButtonProps}
                />
            </FormActions>
        </StyledForm>
    );
};
