import React from 'react';
import { trim } from 'component/common/util';
import { StickinessSelect } from 'component/feature/StrategyTypes/FlexibleStrategy/StickinessSelect/StickinessSelect';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Select from 'component/common/select';
import { ProjectMode } from '../hooks/useProjectForm';
import { Box, styled, TextField } from '@mui/material';
import { CollaborationModeTooltip } from './CollaborationModeTooltip';
import Input from 'component/common/Input/Input';
import { FeatureTogglesLimitTooltip } from './FeatureTogglesLimitTooltip';
import { FeatureFlagNamingTooltip } from './FeatureFlagNamingTooltip';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IProjectForm {
    projectId: string;
    projectName: string;
    projectDesc: string;
    projectStickiness?: string;
    projectMode?: string;
    featureLimit: string;
    featureCount?: number;
    featureNamingPattern: string;
    featureNamingExample: string;
    setProjectNamingPattern?: React.Dispatch<React.SetStateAction<string>>;
    setFeatureNamingExample?: React.Dispatch<React.SetStateAction<string>>;
    setProjectStickiness?: React.Dispatch<React.SetStateAction<string>>;
    setProjectMode?: React.Dispatch<React.SetStateAction<ProjectMode>>;
    setProjectId: React.Dispatch<React.SetStateAction<string>>;
    setProjectName: React.Dispatch<React.SetStateAction<string>>;
    setProjectDesc: React.Dispatch<React.SetStateAction<string>>;
    setFeatureLimit: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: (e: any) => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
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

const StyledSelect = styled(Select)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    minWidth: '200px',
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
    projectMode,
    featureLimit,
    featureCount,
    featureNamingExample,
    featureNamingPattern,
    setFeatureNamingExample,
    setProjectNamingPattern,
    setProjectId,
    setProjectName,
    setProjectDesc,
    setProjectStickiness,
    setProjectMode,
    setFeatureLimit,
    errors,
    mode,
    validateProjectId,
    clearErrors,
}) => {
    const { uiConfig } = useUiConfig();
    const shouldShowFlagNaming = uiConfig.flags.featureNamingPattern;
    const onSetFeatureNamingPattern = (regex: string) => {
        try {
            new RegExp(regex);
            setProjectNamingPattern && setProjectNamingPattern(regex);
            clearErrors();
        } catch (e) {
            errors.featureNamingPattern = 'Invalid regular expression';
            setProjectNamingPattern && setProjectNamingPattern(regex);
        }
    };

    const onSetFeatureNamingExample = (example: string) => {
        if (featureNamingPattern) {
            const regex = new RegExp(featureNamingPattern);
            const matches = regex.test(example);
            if (!matches) {
                errors.namingExample = 'Example does not match regex';
            } else {
                delete errors.namingExample;
            }
            setFeatureNamingExample && setFeatureNamingExample(trim(example));
        }
    };

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
                    <StyledSelect
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
                    ></StyledSelect>
                </>
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
                            name="value"
                            type={'number'}
                            value={featureLimit}
                            onChange={e => setFeatureLimit(e.target.value)}
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
                <ConditionallyRender
                    condition={
                        Boolean(shouldShowFlagNaming) &&
                        setProjectNamingPattern != null &&
                        setFeatureNamingExample != null
                    }
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
                                <p>Feature flag naming pattern?</p>
                                <FeatureFlagNamingTooltip />
                            </Box>
                            <StyledSubtitle>
                                Leave it empty if you don’t want to add a naming
                                pattern
                            </StyledSubtitle>
                            <StyledInputContainer>
                                <StyledInput
                                    label={'Naming Pattern'}
                                    name="pattern"
                                    type={'text'}
                                    value={featureNamingPattern}
                                    error={Boolean(errors.featureNamingPattern)}
                                    errorText={errors.featureNamingPattern}
                                    onFocus={() => clearErrors()}
                                    onChange={e =>
                                        onSetFeatureNamingPattern(
                                            e.target.value
                                        )
                                    }
                                />
                                <StyledInput
                                    label={'Naming Example'}
                                    name="example"
                                    type={'text'}
                                    value={featureNamingExample}
                                    error={Boolean(errors.namingExample)}
                                    errorText={errors.namingExample}
                                    onChange={e =>
                                        onSetFeatureNamingExample(
                                            e.target.value
                                        )
                                    }
                                />
                            </StyledInputContainer>
                        </>
                    }
                />
            </StyledContainer>
            <StyledButtonContainer>{children}</StyledButtonContainer>
        </StyledForm>
    );
};

export default ProjectForm;
