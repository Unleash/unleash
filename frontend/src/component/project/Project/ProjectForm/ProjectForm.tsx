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

    const validateFeatureNamingExample = () => {
        if (featureNamingPattern && featureNamingExample) {
            try {
                const regex = new RegExp(featureNamingPattern);
                const matches = regex.test(featureNamingExample);
                if (!matches) {
                    errors.namingExample = 'Example does not match regex';
                } else {
                    delete errors.namingExample;
                }
            } catch {
                delete errors.namingExample;
            }
        }
    };

    const validateFeatureNaming = ({
        regex,
        example,
    }: {
        regex?: string;
        example?: string;
    }) => {
        const r = regex ?? featureNamingPattern;
        const x = example ?? featureNamingExample;

        if (errors.featureNamingPattern || !x || !r) {
            console.log('Deleting naming example error');
            delete errors.namingExample;
        } else if (x && r) {
            console.log('We have a valid pattern and an example, validating');

            const regex = new RegExp(r);
            const matches = regex.test(x);
            if (!matches) {
                console.log(x, 'does not match regex', r);

                errors.namingExample = 'Example does not match regex';
            } else {
                console.log(x, 'matches regex', r);
                delete errors.namingExample;
            }
        }
    };

    const onSetFeatureNamingPattern = (regex: string) => {
        console.log('New pattern', regex);

        try {
            new RegExp(regex);
            setFeatureNamingPattern && setFeatureNamingPattern(regex);
            delete errors.featureNamingPattern;
        } catch (e) {
            errors.featureNamingPattern = 'Invalid regular expression';
            delete errors.namingExample;
            setFeatureNamingPattern && setFeatureNamingPattern(regex);
        }
        validateFeatureNaming({ regex });
    };

    const onSetFeatureNamingExample = (example: string) => {
        setFeatureNamingExample && setFeatureNamingExample(example);
        validateFeatureNaming({ example });
    };

    const onSetFeatureNamingDescription = (description: string) => {
        setFeatureNamingDescription && setFeatureNamingDescription(description);
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
                                <p id="pattern-naming-description">
                                    A feature flag naming pattern is a{' '}
                                    <a
                                        href={`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        JavaScript RegEx
                                    </a>{' '}
                                    used to enforce feature flag names within
                                    this project.
                                </p>
                                <p>
                                    Leave it empty if you don’t want to add a
                                    naming pattern.
                                </p>
                            </StyledSubtitle>
                            <StyledFlagNamingContainer>
                                <StyledInput
                                    label={'Naming Pattern'}
                                    name="feature flag naming pattern"
                                    aria-describedby="pattern-naming-description"
                                    placeholder="^[A-Za-z]+\.[A-Za-z]+\.[A-Za-z0-9-]+$"
                                    type={'text'}
                                    value={featureNamingPattern || ''}
                                    error={Boolean(errors.featureNamingPattern)}
                                    errorText={errors.featureNamingPattern}
                                    // onFocus={() => clearErrors()}
                                    // onBlur={validateFeatureNamingExample}
                                    onChange={e =>
                                        onSetFeatureNamingPattern(
                                            e.target.value
                                        )
                                    }
                                />
                                <StyledSubtitle>
                                    <p id="pattern-additional-description">
                                        The example and description will be
                                        shown to users when they create a new
                                        feature flag in this project.
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
                                    onBlur={validateFeatureNamingExample}
                                    onChange={e =>
                                        onSetFeatureNamingExample(
                                            e.target.value
                                        )
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
            </StyledContainer>
            <StyledButtonContainer>{children}</StyledButtonContainer>
        </StyledForm>
    );
};

export default ProjectForm;
