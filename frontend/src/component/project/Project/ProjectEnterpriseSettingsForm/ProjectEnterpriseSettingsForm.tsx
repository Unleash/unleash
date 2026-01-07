import React, {
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useEffect,
} from 'react';
import Select from 'component/common/select';
import type { ProjectMode } from '../hooks/useProjectEnterpriseSettingsForm.ts';
import { Box, InputAdornment, styled, TextField } from '@mui/material';
import { CollaborationModeTooltip } from './CollaborationModeTooltip.tsx';
import Input from 'component/common/Input/Input';
import { FeatureFlagNamingTooltip } from './FeatureFlagNamingTooltip.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { ProjectLinkTemplateSchema } from 'openapi';
import ProjectLinkTemplates from './ProjectLinkTemplates/ProjectLinkTemplates.tsx';

interface IProjectEnterpriseSettingsForm {
    projectId: string;
    projectMode?: string;
    featureNamingPattern?: string;
    featureNamingExample?: string;
    featureNamingDescription?: string;
    linkTemplates?: ProjectLinkTemplateSchema[];
    setFeatureNamingPattern?: Dispatch<SetStateAction<string>>;
    setFeatureNamingExample?: Dispatch<SetStateAction<string>>;
    setFeatureNamingDescription?: Dispatch<SetStateAction<string>>;
    setProjectMode?: Dispatch<SetStateAction<ProjectMode>>;
    setLinkTemplates?: Dispatch<SetStateAction<ProjectLinkTemplateSchema[]>>;
    handleSubmit: (e: any) => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
    children?: ReactNode;
}

const StyledForm = styled('form')(({ theme }) => ({
    height: '100%',
    paddingBottom: theme.spacing(4),
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

const useFeatureNamePatternTracking = () => {
    const [previousPattern, setPreviousPattern] = React.useState<string>('');
    const { trackEvent } = usePlausibleTracker();
    const eventName = 'feature-naming-pattern' as const;

    const trackPattern = (pattern: string = '') => {
        if (pattern === previousPattern) {
            // do nothing; they've probably updated something else in the
            // project.
        } else if (pattern === '' && previousPattern !== '') {
            trackEvent(eventName, { props: { action: 'removed' } });
        } else if (pattern !== '' && previousPattern === '') {
            trackEvent(eventName, { props: { action: 'added' } });
        } else if (pattern !== '' && previousPattern !== '') {
            trackEvent(eventName, { props: { action: 'edited' } });
        }
    };

    return { trackPattern, setPreviousPattern };
};

const ProjectEnterpriseSettingsForm: React.FC<
    IProjectEnterpriseSettingsForm
> = ({
    children,
    handleSubmit,
    projectId,
    projectMode,
    featureNamingExample,
    featureNamingPattern,
    featureNamingDescription,
    linkTemplates = [],
    setFeatureNamingExample,
    setFeatureNamingPattern,
    setFeatureNamingDescription,
    setProjectMode,
    setLinkTemplates,
    errors,
}) => {
    const { setPreviousPattern, trackPattern } =
        useFeatureNamePatternTracking();

    const projectModeOptions = [
        { key: 'open', label: 'open' },
        { key: 'protected', label: 'protected' },
        { key: 'private', label: 'private' },
    ];

    useEffect(() => {
        setPreviousPattern(featureNamingPattern || '');
    }, [projectId]);

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
        const disallowedStrings = [
            ' ',
            '\\t',
            '\\s',
            '\\n',
            '\\r',
            '\\f',
            '\\v',
        ];
        if (
            disallowedStrings.some((blockedString) =>
                regex.includes(blockedString),
            )
        ) {
            errors.featureNamingPattern =
                'Whitespace is not allowed in the expression';
        } else {
            try {
                new RegExp(regex);
                delete errors.featureNamingPattern;
            } catch (_e) {
                errors.featureNamingPattern = 'Invalid regular expression';
            }
        }
        setFeatureNamingPattern?.(regex);
        updateNamingExampleError({
            pattern: regex,
            example: featureNamingExample || '',
        });
    };

    const onSetFeatureNamingExample = (example: string) => {
        setFeatureNamingExample?.(example);
        updateNamingExampleError({
            pattern: featureNamingPattern || '',
            example,
        });
    };

    const onSetFeatureNamingDescription = (description: string) => {
        setFeatureNamingDescription?.(description);
    };

    return (
        <StyledForm
            onSubmit={(submitEvent) => {
                handleSubmit(submitEvent);
                trackPattern(featureNamingPattern);
            }}
        >
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
            <StyledFieldset>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 1,
                        gap: 1,
                    }}
                >
                    <legend>Feature flag naming pattern</legend>
                    <FeatureFlagNamingTooltip />
                </Box>
                <StyledSubtitle>
                    <StyledPatternNamingExplanation id='pattern-naming-description'>
                        <p>
                            Define a{' '}
                            <a
                                href={`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet`}
                                target='_blank'
                                rel='noreferrer'
                            >
                                JavaScript RegEx
                            </a>{' '}
                            used to enforce feature flag names within this
                            project. The regex will be surrounded by a leading{' '}
                            <code>^</code> and a trailing <code>$</code>.
                        </p>
                        <p>
                            Leave it empty if you don’t want to add a naming
                            pattern.
                        </p>
                    </StyledPatternNamingExplanation>
                </StyledSubtitle>
                <StyledFlagNamingContainer>
                    <StyledInput
                        label={'Naming Pattern'}
                        name='feature flag naming pattern'
                        aria-describedby='pattern-naming-description'
                        placeholder='[A-Za-z]+.[A-Za-z]+.[A-Za-z0-9-]+'
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    ^
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position='end'>
                                    $
                                </InputAdornment>
                            ),
                        }}
                        type={'text'}
                        value={featureNamingPattern || ''}
                        error={Boolean(errors.featureNamingPattern)}
                        errorText={errors.featureNamingPattern}
                        onChange={(e) =>
                            onSetFeatureNamingPattern(e.target.value)
                        }
                    />
                    <StyledSubtitle>
                        <p id='pattern-additional-description'>
                            The example and description will be shown to users
                            when they create a new feature flag in this project.
                        </p>
                    </StyledSubtitle>

                    <StyledInput
                        label={'Naming Example'}
                        name='feature flag naming example'
                        type={'text'}
                        aria-describedby='pattern-additional-description'
                        value={featureNamingExample || ''}
                        placeholder='dx.feature1.1-135'
                        error={Boolean(errors.namingExample)}
                        errorText={errors.namingExample}
                        onChange={(e) =>
                            onSetFeatureNamingExample(e.target.value)
                        }
                    />
                    <StyledTextField
                        label={'Naming pattern description'}
                        name='feature flag naming description'
                        type={'text'}
                        aria-describedby='pattern-additional-description'
                        placeholder={`<project>.<featureName>.<ticket>

The flag name should contain the project name, the feature name, and the ticket number, each separated by a dot.`}
                        multiline
                        minRows={5}
                        value={featureNamingDescription || ''}
                        onChange={(e) =>
                            onSetFeatureNamingDescription(e.target.value)
                        }
                    />
                </StyledFlagNamingContainer>

                <ProjectLinkTemplates
                    linkTemplates={linkTemplates || []}
                    setLinkTemplates={setLinkTemplates}
                />
            </StyledFieldset>
            <StyledButtonContainer>{children}</StyledButtonContainer>
        </StyledForm>
    );
};

export default ProjectEnterpriseSettingsForm;
