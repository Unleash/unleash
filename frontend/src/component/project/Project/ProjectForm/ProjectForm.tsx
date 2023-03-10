import React from 'react';
import { trim } from 'component/common/util';
import {
    StyledForm,
    StyledContainer,
    StyledDescription,
    StyledInput,
    StyledTextField,
    StyledButtonContainer,
    StyledButton,
} from './ProjectForm.styles';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { StickinessSelect } from 'component/feature/StrategyTypes/FlexibleStrategy/StickinessSelect/StickinessSelect';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
interface IProjectForm {
    projectId: string;
    projectName: string;
    projectDesc: string;
    projectStickiness?: string;
    setProjectStickiness?: React.Dispatch<React.SetStateAction<string>>;
    setProjectId: React.Dispatch<React.SetStateAction<string>>;
    setProjectName: React.Dispatch<React.SetStateAction<string>>;
    setProjectDesc: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
    validateProjectId: () => void;
}

const ProjectForm: React.FC<IProjectForm> = ({
    children,
    handleSubmit,
    handleCancel,
    projectId,
    projectName,
    projectDesc,
    projectStickiness,
    setProjectId,
    setProjectName,
    setProjectDesc,
    setProjectStickiness,
    errors,
    mode,
    validateProjectId,
    clearErrors,
}) => {
    const { uiConfig } = useUiConfig();
    const { projectScopedStickiness } = uiConfig.flags;

    return (
        <StyledForm onSubmit={handleSubmit}>
            <StyledContainer>
                <StyledDescription>What is your project Id?</StyledDescription>
                <StyledInput
                    label="Project Id"
                    value={projectId}
                    onChange={e => setProjectId(trim(e.target.value))}
                    error={Boolean(errors.id)}
                    errorText={errors.id}
                    onFocus={() => clearErrors()}
                    onBlur={validateProjectId}
                    disabled={mode === 'Edit'}
                    autoFocus
                    required
                />

                <StyledDescription>
                    What is your project name?
                </StyledDescription>
                <StyledInput
                    label="Project name"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors()}
                    required
                />

                <StyledDescription>
                    What is your project description?
                </StyledDescription>
                <StyledTextField
                    label="Project description"
                    variant="outlined"
                    multiline
                    maxRows={4}
                    value={projectDesc}
                    onChange={e => setProjectDesc(e.target.value)}
                />

                <ConditionallyRender
                    condition={
                        Boolean(projectScopedStickiness) &&
                        setProjectStickiness != null
                    }
                    show={
                        <>
                            <StyledDescription>
                                What is the default stickiness for the project?
                            </StyledDescription>
                            <StickinessSelect
                                label="Stickiness"
                                value={projectStickiness}
                                onChange={e =>
                                    setProjectStickiness &&
                                    setProjectStickiness(e.target.value)
                                }
                                editable
                            />
                        </>
                    }
                />
            </StyledContainer>

            <StyledButtonContainer>
                {children}
                <StyledButton onClick={handleCancel}>Cancel</StyledButton>
            </StyledButtonContainer>
        </StyledForm>
    );
};

export default ProjectForm;
