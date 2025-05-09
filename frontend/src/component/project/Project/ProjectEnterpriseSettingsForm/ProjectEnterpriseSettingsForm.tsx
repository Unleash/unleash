import React, { useEffect, useState } from 'react';
import Select from 'component/common/select';
import type { ProjectMode } from '../hooks/useProjectEnterpriseSettingsForm';
import { Box, Button, IconButton, InputAdornment, List, ListItem, ListItemText, styled, TextField, Tooltip, Typography } from '@mui/material';
import { CollaborationModeTooltip } from './CollaborationModeTooltip';
import Input from 'component/common/Input/Input';
import { FeatureFlagNamingTooltip } from './FeatureFlagNamingTooltip';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { ProjectLinkTemplateSchema } from 'openapi';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface IProjectEnterpriseSettingsForm {
    projectId: string;
    projectMode?: string;
    featureNamingPattern?: string;
    featureNamingExample?: string;
    featureNamingDescription?: string;
    linkTemplates?: ProjectLinkTemplateSchema[];
    setFeatureNamingPattern?: React.Dispatch<React.SetStateAction<string>>;
    setFeatureNamingExample?: React.Dispatch<React.SetStateAction<string>>;
    setFeatureNamingDescription?: React.Dispatch<React.SetStateAction<string>>;
    setProjectMode?: React.Dispatch<React.SetStateAction<ProjectMode>>;
    setLinkTemplates?: React.Dispatch<React.SetStateAction<ProjectLinkTemplateSchema[]>>;
    handleSubmit: (e: any) => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
    children?: React.ReactNode;
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

const StyledLinkTemplatesContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
}));

const StyledLinkTemplatesList = styled(List)(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
}));

const StyledLinkTemplateItem = styled(ListItem)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
        borderBottom: 'none',
    },
}));

const StyledDialogContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledDialogActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    gap: theme.spacing(1),
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

    // Link template form state
    const [isAddingTemplate, setIsAddingTemplate] = useState(false);
    const [isEditingTemplate, setIsEditingTemplate] = useState(false);
    const [editingTemplateIndex, setEditingTemplateIndex] = useState<number | null>(null);
    const [templateTitle, setTemplateTitle] = useState('');
    const [templateUrl, setTemplateUrl] = useState('');
    const [templateErrors, setTemplateErrors] = useState<{title?: string, url?: string}>({});

    const resetTemplateForm = () => {
        setTemplateTitle('');
        setTemplateUrl('');
        setTemplateErrors({});
        setIsAddingTemplate(false);
        setIsEditingTemplate(false);
        setEditingTemplateIndex(null);
    };

    const validateTemplateForm = () => {
        const errors: {title?: string, url?: string} = {};
        
        if (!templateUrl) {
            errors.url = 'URL template is required';
        } else if (!templateUrl.includes('{{project}}') && !templateUrl.includes('{{feature}}')) {
            errors.url = 'URL template must include at least one placeholder: {{project}} or {{feature}}';
        }

        setTemplateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddTemplate = () => {
        if (validateTemplateForm()) {
            const newTemplate: ProjectLinkTemplateSchema = {
                title: templateTitle || null,
                urlTemplate: templateUrl,
            };
            setLinkTemplates?.([...linkTemplates, newTemplate]);
            resetTemplateForm();
        }
    };

    const handleEditTemplate = (index: number) => {
        setIsEditingTemplate(true);
        setEditingTemplateIndex(index);
        setTemplateTitle(linkTemplates[index].title || '');
        setTemplateUrl(linkTemplates[index].urlTemplate);
    };

    const handleUpdateTemplate = () => {
        if (validateTemplateForm() && editingTemplateIndex !== null) {
            const updatedTemplates = [...linkTemplates];
            updatedTemplates[editingTemplateIndex] = {
                title: templateTitle || null,
                urlTemplate: templateUrl,
            };
            setLinkTemplates?.(updatedTemplates);
            resetTemplateForm();
        }
    };

    const handleDeleteTemplate = (index: number) => {
        const updatedTemplates = [...linkTemplates];
        updatedTemplates.splice(index, 1);
        setLinkTemplates?.(updatedTemplates);
    };

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
            } catch (e) {
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
                    <legend>Feature flag naming pattern?</legend>
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

                {/* Link Templates Section */}
                <StyledLinkTemplatesContainer>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="h4">Project Link Templates</Typography>
                        <Tooltip title="Link templates can be automatically added to new feature flags. They can include placeholders like {{project}} and {{feature}} that will be replaced with actual values.">
                            <IconButton size="small" sx={{ ml: 1 }}>
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <StyledSubtitle>
                        <p>
                            Define link templates that can be automatically added to new feature flags in this project.
                            Use placeholders <code>&#123;&#123;project&#125;&#125;</code> and <code>&#123;&#123;feature&#125;&#125;</code> in the URL that will be replaced with the project and feature names.
                        </p>
                    </StyledSubtitle>

                    {linkTemplates.length > 0 ? (
                        <StyledLinkTemplatesList>
                            {linkTemplates.map((template, index) => (
                                <StyledLinkTemplateItem
                                    key={index}
                                    secondaryAction={
                                        <>
                                            <IconButton edge="end" aria-label="edit" onClick={() => handleEditTemplate(index)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTemplate(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    }
                                >
                                    <ListItemText
                                        primary={template.title || 'Untitled link'}
                                        secondary={template.urlTemplate}
                                    />
                                </StyledLinkTemplateItem>
                            ))}
                        </StyledLinkTemplatesList>
                    ) : (
                        <Box py={2}>
                            <Typography variant="body2" color="textSecondary">
                                No link templates defined yet. Add your first template below.
                            </Typography>
                        </Box>
                    )}

                    {isAddingTemplate || isEditingTemplate ? (
                        <StyledDialogContent>
                            <Typography variant="h5">
                                {isAddingTemplate ? 'Add new link template' : 'Edit link template'}
                            </Typography>
                            <TextField
                                label="Title (optional)"
                                fullWidth
                                value={templateTitle}
                                onChange={(e) => setTemplateTitle(e.target.value)}
                                placeholder="e.g., Jira Ticket"
                                helperText="A descriptive name for the link"
                            />
                            <TextField
                                label="URL Template"
                                fullWidth
                                required
                                value={templateUrl}
                                onChange={(e) => setTemplateUrl(e.target.value)}
                                placeholder="https://jira.example.com/browse/{{project}}-{{feature}}"
                                helperText={templateErrors.url || "Use placeholders {{project}} and {{feature}} that will be replaced with actual values"}
                                error={Boolean(templateErrors.url)}
                            />
                            <StyledDialogActions>
                                <Button variant="outlined" onClick={resetTemplateForm}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={isAddingTemplate ? handleAddTemplate : handleUpdateTemplate}
                                >
                                    {isAddingTemplate ? 'Add' : 'Update'}
                                </Button>
                            </StyledDialogActions>
                        </StyledDialogContent>
                    ) : (
                        <Button 
                            startIcon={<AddIcon />} 
                            variant="outlined" 
                            onClick={() => setIsAddingTemplate(true)}
                        >
                            Add link template
                        </Button>
                    )}
                </StyledLinkTemplatesContainer>
            </StyledFieldset>
            <StyledButtonContainer>{children}</StyledButtonContainer>
        </StyledForm>
    );
};

export default ProjectEnterpriseSettingsForm;
