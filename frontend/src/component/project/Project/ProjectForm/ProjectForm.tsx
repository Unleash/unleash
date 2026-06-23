import type React from 'react';
import { trim } from 'component/common/util';
import { StickinessSelect } from 'component/feature/StrategyTypes/FlexibleStrategy/StickinessSelect/StickinessSelect';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Box, styled, TextField } from '@mui/material';
import { FormField } from 'component/common/FormField/FormField';
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

const StyledLabelWithTooltip = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
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

const StyledInputContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    // Align the "x of y used" note to the input baseline, not the label above.
    alignItems: 'flex-end',
    gap: theme.spacing(1.5),
    // The field grows; the note keeps its width. Spacing is owned by the row.
    '& > :first-of-type': {
        flex: 1,
    },
    '& > *': {
        marginBottom: 0,
    },
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
            <FormField
                label='Project Id'
                description='What is your project Id?'
            >
                <TextField
                    fullWidth
                    value={projectId}
                    onChange={(e) => setProjectId(trim(e.target.value))}
                    error={Boolean(errors.id)}
                    helperText={errors.id}
                    onFocus={() => clearErrors()}
                    onBlur={validateProjectId}
                    disabled={mode === 'Edit'}
                    data-testid={PROJECT_ID_INPUT}
                    autoFocus
                    required
                />
            </FormField>

            <FormField
                label='Project name'
                description='What is your project name?'
            >
                <TextField
                    fullWidth
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    onFocus={() => {
                        delete errors.name;
                    }}
                    data-testid={PROJECT_NAME_INPUT}
                    required
                />
            </FormField>

            <FormField
                label='Project description'
                description='What is your project description?'
            >
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    data-testid={PROJECT_DESCRIPTION_INPUT}
                />
            </FormField>

            <ConditionallyRender
                condition={setProjectStickiness != null}
                show={
                    <FormField
                        label='Stickiness'
                        description='What is the default stickiness for the project?'
                    >
                        <StickinessSelect
                            label=''
                            value={projectStickiness}
                            data-testid={PROJECT_STICKINESS_SELECT}
                            onChange={(e) =>
                                setProjectStickiness?.(e.target.value)
                            }
                        />
                    </FormField>
                }
            />
            <ConditionallyRender
                condition={mode === 'Edit'}
                show={() => (
                    <StyledInputContainer>
                        <FormField
                            label={
                                <StyledLabelWithTooltip>
                                    Feature flag limit
                                    <FeatureTogglesLimitTooltip />
                                </StyledLabelWithTooltip>
                            }
                            description='Leave it empty if you don’t want to add a limit'
                        >
                            <TextField
                                fullWidth
                                name='value'
                                type='number'
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
                        </FormField>
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
                )}
            />
            <ConditionallyRender
                condition={mode === 'Create' && isEnterprise()}
                show={
                    <FormField
                        label={
                            <StyledLabelWithTooltip>
                                Project collaboration mode
                                <CollaborationModeTooltip />
                            </StyledLabelWithTooltip>
                        }
                        description='What is your project collaboration mode?'
                    >
                        <StyledSelect
                            value={projectMode}
                            name='Project collaboration mode'
                            onChange={(e) => {
                                setProjectMode?.(e.target.value as ProjectMode);
                            }}
                            options={projectModeOptions}
                        />
                    </FormField>
                }
            />
            <StyledButtonContainer>{children}</StyledButtonContainer>
        </StyledForm>
    );
};

export default ProjectForm;
