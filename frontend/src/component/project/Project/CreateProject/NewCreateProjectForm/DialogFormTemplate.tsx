import type { FormEventHandler, PropsWithChildren } from 'react';
import theme from 'themes/theme';
import {
    OptionButtons,
    ProjectDescriptionContainer,
    ProjectNameContainer,
    StyledForm,
    StyledHeader,
    StyledInput,
    TopGrid,
    LimitContainer,
    FormActions,
} from './NewProjectForm.styles';
import { Button } from '@mui/material';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import type { IPermissionButtonProps } from 'component/common/PermissionButton/PermissionButton';

type FormProps = {
    createButtonProps: IPermissionButtonProps;
    description: string;
    errors: { [key: string]: string };
    handleSubmit: FormEventHandler<HTMLFormElement>;
    Icon: React.ReactNode;
    Limit: React.ReactNode;
    name: string;
    onClose: () => void;
    optionButtons: React.ReactNode;
    resource: string;
    setDescription: (newDescription: string) => void;
    setName: (newName: string) => void;
};

export const DialogFormTemplate: React.FC<PropsWithChildren<FormProps>> = ({
    children,
    Limit,
    handleSubmit,
    name,
    setName,
    description,
    setDescription,
    errors,
    Icon,
    resource,
    onClose,
    optionButtons,
    createButtonProps,
}) => {
    return (
        <StyledForm onSubmit={handleSubmit}>
            <TopGrid>
                {Icon}
                <StyledHeader variant='h2'>Create {resource}</StyledHeader>
                <ProjectNameContainer>
                    <StyledInput
                        label={`${resource} name`}
                        aria-required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={Boolean(errors.name)}
                        errorText={errors.name}
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
                    />
                </ProjectDescriptionContainer>
            </TopGrid>

            <OptionButtons>{optionButtons}</OptionButtons>

            <LimitContainer>{Limit}</LimitContainer>
            <FormActions>
                <Button onClick={onClose}>Cancel</Button>
                <CreateButton name={resource} {...createButtonProps} />
            </FormActions>
        </StyledForm>
    );
};
