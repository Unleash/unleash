import type React from 'react';
import { trim } from 'component/common/util';
import { StickinessSelect } from 'component/feature/StrategyTypes/FlexibleStrategy/StickinessSelect/StickinessSelect';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Box, styled, TextField } from '@mui/material';
import Input from 'component/common/Input/Input';
import { FeatureTogglesLimitTooltip } from './FeatureTogglesLimitTooltip.tsx';
import type { ProjectMode } from '../hooks/useProjectEnterpriseSettingsForm.ts';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { CollaborationModeTooltip } from '../ProjectEnterpriseSettingsForm/CollaborationModeTooltip.tsx';
import Select from 'component/common/select';

interface IProjectForm {
    projectId: string;
    projectName: string;
    projectDesc: string;
    projectStickiness?: string;
    featureLimit?: string;
    featureCount?: number;
    projectMode?: string;
    setProjectStickiness?: React.Dispatch<React.SetStateAction<string>>;
    setProjectId: React.Dispatch<React.SetStateAction<string>>;
    setProjectName: React.Dispatch<React.SetStateAction<string>>;
    setProjectDesc: React.Dispatch<React.SetStateAction<string>>;
    setFeatureLimit?: React.Dispatch<React.SetStateAction<string>>;
    setProjectMode?: React.Dispatch<React.SetStateAction<ProjectMode>>;
    handleSubmit: (e: any) => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
    validateProjectId: () => void;
    children?: React.ReactNode;
}

const PROJECT_STICKINESS_SELECT = 'PROJECT_STICKINESS_SELECT';
const PROJECT_ID_INPUT = 'PROJECT_ID_INPUT';
const PROJECT_NAME_INPUT = 'PROJECT_NAME_INPUT';
const PROJECT_DESCRIPTION_INPUT = 'PROJECT_DESCRIPTION_INPUT';

const StyledForm = styled('form')(({ theme }) => ({
    height: '100%',
    paddingBottom: theme.spacing(1),
}));

const StyledDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    minWidth: '200px',
}));

const StyledSubtitle = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 1.25,
    paddingBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
    paddingRight: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledInputContainer = styled('div')(() => ({
    display: 'flex',
    alignItems: 'center',
}));

const ProjectForm: React.FC<IProjectForm> = ({
    children,
    handleSubmit,
    projectId,
    projectName,
    projectDesc,
    projectStickiness,
    featureLimit,
    featureCount,
    projectMode,
    setProjectMode,
    setProjectId,
    setProjectName,
    setProjectDesc,
    setProjectStickiness,
    setFeatureLimit,
    errors,
    mode,
    validateProjectId,
    clearErrors,
}) => {
    const { isEnterprise } = useUiConfig();

    const projectModeOptions = [
        { key: 'open', label: 'open' },
        { key: 'protected', label: 'protected' },
        { key: 'private', label: 'private' },
    ];

    return (
        <StyledForm
            onSubmit={(submitEvent) => {
                handleSubmit(submitEvent);
            }}
        >
            <StyledDescription>What is your project Id?</StyledDescription>
            <StyledInput
                label='Project Id'
                value={projectId}
                onChange={(e) => setProjectId(trim(e.target.value))}
                error={Boolean(errors.id)}
                errorText={errors.id}
                onFocus={() => clearErrors()}
                onBlur={validateProjectId}
                disabled={mode === 'Edit'}
                data-testid={PROJECT_ID_INPUT}
                autoFocus
                required
            />

            <StyledDescription>What is your project name?</StyledDescription>
            <StyledInput
                label='Project name'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                error={Boolean(errors.name)}
                errorText={errors.name}
                onFocus={() => {
                    delete errors.name;
                }}
                data-testid={PROJECT_NAME_INPUT}
                required
            />

            <StyledDescription>
                What is your project description?
            </StyledDescription>
            <StyledTextField
                label='Project description'
                variant='outlined'
                multiline
                maxRows={4}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
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
                            label='Stickiness'
                            value={projectStickiness}
                            data-testid={PROJECT_STICKINESS_SELECT}
                            onChange={(e) =>
                                setProjectStickiness?.(e.target.value)
                            }
                        />
                    </>
                }
            />
            <ConditionallyRender
                condition={mode === 'Edit'}
                show={() => (
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 1,
                                gap: 1,
                            }}
                        >
                            <p>Feature flag limit?</p>
                            <FeatureTogglesLimitTooltip />
                        </Box>
                        <StyledSubtitle>
                            Leave it empty if you don’t want to add a limit
                        </StyledSubtitle>
                        <StyledInputContainer>
                            <StyledInput
                                label={'Limit'}
                                name='value'
                                type={'number'}
                                value={
                                    featureLimit === 'null' ||
                                    featureLimit === undefined
                                        ? ''
                                        : featureLimit
                                }
                                onChange={(e) =>
                                    setFeatureLimit!(e.target.value)
                                }
                            />
                            <ConditionallyRender
                                condition={
                                    featureCount !== undefined &&
                                    Boolean(featureLimit)
                                }
                                show={
                                    <Box>
                                        ({featureCount} of {featureLimit} used)
                                    </Box>
                                }
                            />
                        </StyledInputContainer>
                    </>
                )}
            />
            <ConditionallyRender
                condition={mode === 'Create' && isEnterprise()}
                show={
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
                        <StyledSelect
                            id='project-mode'
                            value={projectMode}
                            label='Project collaboration mode'
                            name='Project collaboration mode'
                            onChange={(e) => {
                                setProjectMode?.(e.target.value as ProjectMode);
                            }}
                            options={projectModeOptions}
                        />
                    </>
                }
            />
            <StyledButtonContainer>{children}</StyledButtonContainer>
        </StyledForm>
    );
};

export default ProjectForm;
