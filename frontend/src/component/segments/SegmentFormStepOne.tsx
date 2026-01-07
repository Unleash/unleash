import { Autocomplete, Box, Button, styled, TextField } from '@mui/material';
import Input from 'component/common/Input/Input';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SegmentFormStep } from './SegmentForm.tsx';
import {
    SEGMENT_NAME_ID,
    SEGMENT_DESC_ID,
    SEGMENT_NEXT_BTN_ID,
} from 'utils/testIds';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import { GO_BACK } from 'constants/navigate';
import {
    type ChangeRequestNewStrategy,
    type ChangeRequestUpdatedStrategy,
    useStrategiesBySegment,
} from 'hooks/api/getters/useStrategiesBySegment/useStrategiesBySegment';
import { SegmentProjectAlert } from './SegmentProjectAlert.tsx';
import { sortStrategiesByFeature } from './SegmentDelete/SegmentDeleteUsedSegment/sort-strategies.ts';
import type { IFeatureStrategy } from 'interfaces/strategy';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { Limit } from '../common/Limit/Limit.tsx';

interface ISegmentFormPartOneProps {
    name: string;
    description: string;
    project?: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setProject: React.Dispatch<React.SetStateAction<string | undefined>>;
    errors: { [key: string]: string };
    clearErrors: () => void;
    setCurrentStep: React.Dispatch<React.SetStateAction<SegmentFormStep>>;
}

const StyledForm = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

const StyledContainer = styled('div')({
    maxWidth: '400px',
});

const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

const StyledButtonContainer = styled('div')({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
});

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

const useSegmentLimit = () => {
    const { segments, loading: loadingSegments } = useSegments();
    const { uiConfig, loading: loadingConfig } = useUiConfig();
    const segmentsLimit = uiConfig.resourceLimits.segments;
    const segmentsCount = segments?.length || 0;
    const limitReached = segmentsCount >= segmentsLimit;

    return {
        limit: segmentsLimit,
        limitReached,
        currentCount: segmentsCount,
        loading: loadingSegments || loadingConfig,
    };
};

export const SegmentFormStepOne: React.FC<ISegmentFormPartOneProps> = ({
    name,
    description,
    project,
    setName,
    setDescription,
    setProject,
    errors,
    setCurrentStep,
}) => {
    const segmentId = useOptionalPathParam('segmentId');
    const projectId = useOptionalPathParam('projectId');
    const navigate = useNavigate();
    const { projects, loading: loadingProjects } = useProjects();
    const {
        limitReached,
        limit,
        currentCount,
        loading: loadingSegmentLimit,
    } = useSegmentLimit();

    const {
        strategies,
        changeRequestStrategies,
        loading: loadingStrategies,
    } = useStrategiesBySegment(segmentId);

    const collectedStrategies = sortStrategiesByFeature<
        IFeatureStrategy,
        ChangeRequestUpdatedStrategy,
        ChangeRequestNewStrategy
    >(strategies ?? [], changeRequestStrategies ?? []);

    const projectsUsed = new Set<string>(
        collectedStrategies.map(({ projectId }) => projectId!).filter(Boolean),
    );
    const availableProjects = projects.filter(
        ({ id }) =>
            !projectsUsed.size ||
            (projectsUsed.size === 1 && projectsUsed.has(id)),
    );

    const [selectedProject, setSelectedProject] = React.useState(
        projects.find(({ id }) => id === project) ?? null,
    );

    useEffect(() => {
        setSelectedProject(projects.find(({ id }) => id === project) ?? null);
    }, [project, projects]);

    const loading = loadingProjects || loadingStrategies || loadingSegmentLimit;

    return (
        <StyledForm>
            <StyledContainer>
                <StyledInputDescription>
                    What is the segment name?
                </StyledInputDescription>
                <StyledInput
                    label='Segment name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    label='Description (optional)'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={Boolean(errors.description)}
                    errorText={errors.description}
                    data-testid={SEGMENT_DESC_ID}
                />
                <ConditionallyRender
                    condition={!projectId && !loading}
                    show={
                        <>
                            <StyledInputDescription>
                                Is this segment tied to a specific project?
                            </StyledInputDescription>
                            <Autocomplete
                                size='small'
                                value={selectedProject}
                                onChange={(_, newValue) => {
                                    setProject(newValue?.id);
                                }}
                                options={availableProjects}
                                getOptionLabel={(option) => option.name}
                                renderInput={(params) => (
                                    <TextField {...params} label='Project' />
                                )}
                                disabled={projectsUsed.size > 1}
                            />
                            <SegmentProjectAlert
                                projects={projects}
                                strategies={collectedStrategies}
                                projectsUsed={Array.from(projectsUsed)}
                                availableProjects={availableProjects}
                            />
                        </>
                    }
                />
            </StyledContainer>

            <LimitContainer>
                <Limit
                    name='segments'
                    limit={limit}
                    currentValue={currentCount}
                />
            </LimitContainer>

            <StyledButtonContainer>
                <Button
                    type='button'
                    variant='contained'
                    color='primary'
                    onClick={() => setCurrentStep(2)}
                    disabled={
                        loading ||
                        limitReached ||
                        name.length === 0 ||
                        Boolean(errors.name)
                    }
                    data-testid={SEGMENT_NEXT_BTN_ID}
                >
                    Next
                </Button>
                <StyledCancelButton
                    type='button'
                    onClick={() => {
                        navigate(GO_BACK);
                    }}
                >
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </StyledForm>
    );
};
