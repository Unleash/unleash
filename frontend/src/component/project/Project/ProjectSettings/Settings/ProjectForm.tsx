import React from 'react';
import { trim } from 'component/common/util';
import { StickinessSelect } from 'component/feature/StrategyTypes/FlexibleStrategy/StickinessSelect/StickinessSelect';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Select from 'component/common/select';
import { ProjectMode } from '../../hooks/useProjectForm';
import { Box, Button, styled, TextField } from '@mui/material';
import { CollaborationModeTooltip } from '../../ProjectForm/CollaborationModeTooltip';
import Input from 'component/common/Input/Input';

interface IProjectForm {
    projectId: string;
    projectName: string;
    projectDesc: string;
    projectStickiness?: string;
    projectMode?: string;
    setProjectStickiness?: React.Dispatch<React.SetStateAction<string>>;
    setProjectMode?: React.Dispatch<React.SetStateAction<ProjectMode>>;
    setProjectId: React.Dispatch<React.SetStateAction<string>>;
    setProjectName: React.Dispatch<React.SetStateAction<string>>;
    setProjectDesc: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
    validateProjectId: () => void;
}

const PROJECT_STICKINESS_SELECT = 'PROJECT_STICKINESS_SELECT';
const PROJECT_ID_INPUT = 'PROJECT_ID_INPUT';
const PROJECT_NAME_INPUT = 'PROJECT_NAME_INPUT';
const PROJECT_DESCRIPTION_INPUT = 'PROJECT_DESCRIPTION_INPUT';

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    paddingBottom: theme.spacing(4),
}));

const StyledContainer = styled('div')(() => ({
    maxWidth: '400px',
}));

const StyledDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

export const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

export const StyledButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const ProjectForm: React.FC<IProjectForm> = ({
    children,
    handleSubmit,
    projectId,
    projectName,
    projectDesc,
    projectStickiness,
    projectMode,
    setProjectId,
    setProjectName,
    setProjectDesc,
    setProjectStickiness,
    setProjectMode,
    errors,
    validateProjectId,
    clearErrors,
}) => {
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
                    disabled={true}
                    data-testid={PROJECT_ID_INPUT}
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
                    data-testid={PROJECT_NAME_INPUT}
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
                    data-testid={PROJECT_DESCRIPTION_INPUT}
                />

                <ConditionallyRender
                    condition={setProjectStickiness != null}
                    show={
                        <>
                            <StyledDescription>
                                What is the default stickiness for the project?
                            </StyledDescription>
                            <StickinessSelect
                                label="Stickiness"
                                value={projectStickiness}
                                data-testid={PROJECT_STICKINESS_SELECT}
                                onChange={e =>
                                    setProjectStickiness &&
                                    setProjectStickiness(e.target.value)
                                }
                                editable
                            />
                        </>
                    }
                />
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 1,
                            gap: 1,
                        }}
                    >
                        <p>What is your project collaboration mode?</p>
                        <CollaborationModeTooltip />
                    </Box>
                    <Select
                        id="project-mode"
                        value={projectMode}
                        label="Project collaboration mode"
                        name="Project collaboration mode"
                        onChange={e => {
                            setProjectMode?.(e.target.value as ProjectMode);
                        }}
                        options={[
                            { key: 'open', label: 'open' },
                            { key: 'protected', label: 'protected' },
                        ]}
                        style={{ minWidth: '200px' }}
                    ></Select>
                </>
            </StyledContainer>

            <StyledButtonContainer>{children}</StyledButtonContainer>
        </StyledForm>
    );
};

export default ProjectForm;
