import React from 'react';
import { trim } from 'component/common/util';
import { StickinessSelect } from 'component/feature/StrategyTypes/FlexibleStrategy/StickinessSelect/StickinessSelect';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Select from 'component/common/select';
import { ProjectMode } from '../hooks/useProjectForm';
import { Box, InputAdornment, styled, TextField } from '@mui/material';
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
    featureNamingPattern?: string;
    featureNamingExample?: string;
    featureNamingDescription?: string;
    setFeatureNamingPattern?: React.Dispatch<React.SetStateAction<string>>;
    setFeatureNamingExample?: React.Dispatch<React.SetStateAction<string>>;
    setFeatureNamingDescription?: React.Dispatch<React.SetStateAction<string>>;
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
    height: '100%',
    paddingBottom: theme.spacing(4),
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

const StyledFieldset = styled('fieldset')(() => ({
    padding: 0,
    border: 'none',
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

const StyledFlagNamingContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    '& > *': { width: '100%' },
}));

const StyledPatternNamingExplanation = styled('div')(({ theme }) => ({
    'p + p': { marginTop: theme.spacing(1) },
}));

export const validateFeatureNamingExample = ({
    pattern,
    example,
    featureNamingPatternError,
}: {
    pattern: string;
    example: string;
    featureNamingPatternError: string | undefined;
}): { state: 'valid' } | { state: 'invalid'; reason: string } => {
    if (featureNamingPatternError || !example || !pattern) {
        return { state: 'valid' };
    } else if (example && pattern) {
        const regex = new RegExp(`^${pattern}$`);
        const matches = regex.test(example);
        if (!matches) {
            return { state: 'invalid', reason: 'Example does not match regex' };
        } else {
            return { state: 'valid' };
        }
    }
    return { state: 'valid' };
};

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
    featureNamingDescription,
    setFeatureNamingExample,
    setFeatureNamingPattern,
    setFeatureNamingDescription,
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

    const updateNamingExampleError = ({
        example,
        pattern,
    }: {
        example: string;
        pattern: string;
    }) => {
        const validationResult = validateFeatureNamingExample({
            pattern,
            example,
            featureNamingPatternError: errors.featureNamingPattern,
        });

        switch (validationResult.state) {
            case 'invalid':
                errors.namingExample = validationResult.reason;
                break;
            case 'valid':
                delete errors.namingExample;
                break;
        }
    };

    const onSetFeatureNamingPattern = (regex: string) => {
        try {
            new RegExp(regex);
            setFeatureNamingPattern && setFeatureNamingPattern(regex);
            delete errors.featureNamingPattern;
        } catch (e) {
            errors.featureNamingPattern = 'Invalid regular expression';
            setFeatureNamingPattern && setFeatureNamingPattern(regex);
        }
        updateNamingExampleError({
            pattern: regex,
            example: featureNamingExample || '',
        });
    };

    const onSetFeatureNamingExample = (example: string) => {
        setFeatureNamingExample && setFeatureNamingExample(example);
        updateNamingExampleError({
            pattern: featureNamingPattern || '',
            example,
        });
    };

    const onSetFeatureNamingDescription = (description: string) => {
        setFeatureNamingDescription && setFeatureNamingDescription(description);
    };

    return (
        <StyledForm onSubmit={handleSubmit}>
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

            <StyledDescription>What is your project name?</StyledDescription>
            <StyledInput
                label="Project name"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
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
                            featureCount !== undefined && Boolean(featureLimit)
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
                condition={Boolean(shouldShowFlagNaming)}
                show={
                    <StyledFieldset>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 1,
                                gap: 1,
                            }}
                        >
                            <legend>Feature flag naming pattern?</legend>
                            <FeatureFlagNamingTooltip />
                        </Box>
                        <StyledSubtitle>
                            <StyledPatternNamingExplanation id="pattern-naming-description">
                                <p>
                                    Define a{' '}
                                    <a
                                        href={`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        JavaScript RegEx
                                    </a>{' '}
                                    used to enforce feature flag names within
                                    this project. The regex will be surrounded
                                    by a leading <code>^</code> and a trailing{' '}
                                    <code>$</code>.
                                </p>
                                <p>
                                    Leave it empty if you don’t want to add a
                                    naming pattern.
                                </p>
                            </StyledPatternNamingExplanation>
                        </StyledSubtitle>
                        <StyledFlagNamingContainer>
                            <StyledInput
                                label={'Naming Pattern'}
                                name="feature flag naming pattern"
                                aria-describedby="pattern-naming-description"
                                placeholder="[A-Za-z]+\.[A-Za-z]+\.[A-Za-z0-9-]+"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            ^
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            $
                                        </InputAdornment>
                                    ),
                                }}
                                type={'text'}
                                value={featureNamingPattern || ''}
                                error={Boolean(errors.featureNamingPattern)}
                                errorText={errors.featureNamingPattern}
                                onChange={e =>
                                    onSetFeatureNamingPattern(e.target.value)
                                }
                            />
                            <StyledSubtitle>
                                <p id="pattern-additional-description">
                                    The example and description will be shown to
                                    users when they create a new feature flag in
                                    this project.
                                </p>
                            </StyledSubtitle>

                            <StyledInput
                                label={'Naming Example'}
                                name="feature flag naming example"
                                type={'text'}
                                aria-describedby="pattern-additional-description"
                                value={featureNamingExample || ''}
                                placeholder="dx.feature1.1-135"
                                error={Boolean(errors.namingExample)}
                                errorText={errors.namingExample}
                                onChange={e =>
                                    onSetFeatureNamingExample(e.target.value)
                                }
                            />
                            <StyledTextField
                                label={'Naming pattern description'}
                                name="feature flag naming description"
                                type={'text'}
                                aria-describedby="pattern-additional-description"
                                placeholder={`<project>.<featureName>.<ticket>

The flag name should contain the project name, the feature name, and the ticket number, each separated by a dot.`}
                                multiline
                                minRows={5}
                                value={featureNamingDescription || ''}
                                onChange={e =>
                                    onSetFeatureNamingDescription(
                                        e.target.value
                                    )
                                }
                            />
                        </StyledFlagNamingContainer>
                    </StyledFieldset>
                }
            />
            <StyledButtonContainer>{children}</StyledButtonContainer>
        </StyledForm>
    );
};

export default ProjectForm;
