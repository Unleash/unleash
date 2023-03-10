import { Autocomplete, Button, styled, TextField } from '@mui/material';
import Input from 'component/common/Input/Input';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SegmentFormStep } from './SegmentForm';
import {
    SEGMENT_NAME_ID,
    SEGMENT_DESC_ID,
    SEGMENT_NEXT_BTN_ID,
} from 'utils/testIds';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

interface ISegmentFormPartOneProps {
    name: string;
    description: string;
    project: string | null;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setProject: React.Dispatch<React.SetStateAction<string | null>>;
    errors: { [key: string]: string };
    clearErrors: () => void;
    setCurrentStep: React.Dispatch<React.SetStateAction<SegmentFormStep>>;
}

const StyledForm = styled('div')(({ theme }) => ({
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

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

export const SegmentFormStepOne: React.FC<ISegmentFormPartOneProps> = ({
    children,
    name,
    description,
    project,
    setName,
    setDescription,
    setProject,
    errors,
    clearErrors,
    setCurrentStep,
}) => {
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const { projects } = useProjects();

    const [selectedProject, setSelectedProject] = React.useState(
        projects.find(({ id }) => id === project) ?? null
    );

    useEffect(() => {
        setSelectedProject(projects.find(({ id }) => id === project) ?? null);
    }, [project, projects]);

    return (
        <StyledForm>
            <StyledContainer>
                <StyledInputDescription>
                    What is the segment name?
                </StyledInputDescription>
                <StyledInput
                    label="Segment name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    autoFocus
                    required
                    data-testid={SEGMENT_NAME_ID}
                />
                <StyledInputDescription>
                    What is the segment description?
                </StyledInputDescription>
                <StyledInput
                    label="Description (optional)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    error={Boolean(errors.description)}
                    errorText={errors.description}
                    data-testid={SEGMENT_DESC_ID}
                />
                <ConditionallyRender
                    condition={Boolean(uiConfig.flags.projectScopedSegments)}
                    show={
                        <>
                            <StyledInputDescription>
                                Is this segment tied to a specific project?
                            </StyledInputDescription>
                            <Autocomplete
                                size="small"
                                value={selectedProject}
                                onChange={(_, newValue) => {
                                    setProject(newValue?.id ?? null);
                                }}
                                options={projects}
                                getOptionLabel={option => option.name}
                                renderInput={params => (
                                    <TextField {...params} label="Project" />
                                )}
                            />
                        </>
                    }
                />
            </StyledContainer>
            <StyledButtonContainer>
                <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={() => setCurrentStep(2)}
                    disabled={name.length === 0 || Boolean(errors.name)}
                    data-testid={SEGMENT_NEXT_BTN_ID}
                >
                    Next
                </Button>
                <StyledCancelButton
                    type="button"
                    onClick={() => {
                        navigate('/segments');
                    }}
                >
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </StyledForm>
    );
};
