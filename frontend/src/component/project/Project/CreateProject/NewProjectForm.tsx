import { Typography, styled } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import Input from 'component/common/Input/Input';
import type { ProjectMode } from '../hooks/useProjectEnterpriseSettingsForm';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIconSmall.svg';
import {
    MultiselectList,
    SingleSelectList,
    TableSelect,
} from './SelectionButton';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import StickinessIcon from '@mui/icons-material/FormatPaint';
import ProjectModeIcon from '@mui/icons-material/Adjust';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import EnvironmentsIcon from '@mui/icons-material/CloudCircle';
import { useStickinessOptions } from 'hooks/useStickinessOptions';
import { ReactComponent as ChangeRequestIcon } from 'assets/icons/merge.svg';

const StyledForm = styled('form')(({ theme }) => ({
    background: theme.palette.background.default,
}));

const StyledFormSection = styled('div')(({ theme }) => ({
    '& + *': {
        borderBlockStart: `1px solid ${theme.palette.divider}`,
    },

    padding: theme.spacing(6),
}));

const TopGrid = styled(StyledFormSection)(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas:
        '"icon header" "icon project-name" "icon project-description"',
    gridTemplateColumns: 'auto 1fr',
    gap: theme.spacing(2),
}));

const StyledIcon = styled(ProjectIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    gridArea: 'header',
    alignSelf: 'center',
    fontWeight: 'lighter',
}));

const ProjectNameContainer = styled('div')(({ theme }) => ({
    gridArea: 'project-name',
}));

const ProjectDescriptionContainer = styled('div')(({ theme }) => ({
    gridArea: 'project-description',
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    fieldset: { border: 'none' },
}));

const StyledProjectName = styled(StyledInput)(({ theme }) => ({
    '*': { fontSize: theme.typography.h2.fontSize },
}));

const StyledProjectDescription = styled(StyledInput)(({ theme }) => ({
    '*': { fontSize: theme.typography.h3.fontSize },
}));

const OptionButtons = styled(StyledFormSection)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(2),
}));

const FormActions = styled(StyledFormSection)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(5),
    justifyContent: 'flex-end',
}));

type FormProps = {
    projectId: string;
    projectName: string;
    projectDesc: string;
    projectStickiness: string;
    featureLimit?: string;
    featureCount?: number;
    projectMode: string;
    projectEnvironments: Set<string>;
    projectChangeRequestConfiguration: Record<
        string,
        { requiredApprovals: number }
    >;
    setProjectStickiness: React.Dispatch<React.SetStateAction<string>>;
    setProjectEnvironments: (envs: Set<string>) => void;
    setProjectId: React.Dispatch<React.SetStateAction<string>>;
    setProjectName: React.Dispatch<React.SetStateAction<string>>;
    setProjectDesc: React.Dispatch<React.SetStateAction<string>>;
    setFeatureLimit?: React.Dispatch<React.SetStateAction<string>>;
    setProjectMode: React.Dispatch<React.SetStateAction<ProjectMode>>;
    updateProjectChangeRequestConfig: {
        disableChangeRequests: (env: string) => void;
        enableChangeRequests: (env: string, requiredApprovals: number) => void;
    };
    handleSubmit: (e: any) => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
    validateProjectId: () => void;
    overrideDocumentation: (description: string) => void;
    clearDocumentationOverride: () => void;
};

const PROJECT_NAME_INPUT = 'PROJECT_NAME_INPUT';
const PROJECT_DESCRIPTION_INPUT = 'PROJECT_DESCRIPTION_INPUT';

export const NewProjectForm: React.FC<FormProps> = ({
    children,
    handleSubmit,
    projectName,
    projectDesc,
    projectStickiness,
    projectEnvironments,
    projectChangeRequestConfiguration,
    featureLimit,
    featureCount,
    projectMode,
    setProjectMode,
    setProjectEnvironments,
    setProjectId,
    setProjectName,
    setProjectDesc,
    setProjectStickiness,
    // setProjectChangeRequestConfiguration,
    updateProjectChangeRequestConfig,
    setFeatureLimit,
    errors,
    mode,
    clearErrors,
    overrideDocumentation,
    clearDocumentationOverride,
}) => {
    const { isEnterprise } = useUiConfig();
    const { environments: allEnvironments } = useEnvironments();
    const activeEnvironments = allEnvironments.filter((env) => env.enabled);

    const handleProjectNameUpdate = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const input = e.target.value;
        setProjectName(input);

        // todo: handle this in a real manner. This is a hack for now.
        const maybeProjectId = input
            ? `${encodeURIComponent(input.trim())}-${uuidv4().slice(-12)}`
            : '';
        setProjectId(maybeProjectId);
    };

    const projectModeOptions = [
        { value: 'open', label: 'open' },
        { value: 'protected', label: 'protected' },
        { value: 'private', label: 'private' },
    ];

    const stickinessOptions = useStickinessOptions(projectStickiness);

    return (
        <StyledForm
            onSubmit={(submitEvent) => {
                handleSubmit(submitEvent);
            }}
        >
            <TopGrid>
                <StyledIcon aria-hidden='true' />
                <StyledHeader variant='h2'>New project</StyledHeader>
                <ProjectNameContainer>
                    <StyledProjectName
                        label='Project name'
                        required
                        value={projectName}
                        onChange={handleProjectNameUpdate}
                        error={Boolean(errors.name)}
                        errorText={errors.name}
                        onFocus={() => {
                            delete errors.name;
                        }}
                        data-testid={PROJECT_NAME_INPUT}
                        autoFocus
                    />
                </ProjectNameContainer>
                <ProjectDescriptionContainer>
                    <StyledProjectDescription
                        className='description'
                        label='Description (optional)'
                        multiline
                        maxRows={20}
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        data-testid={PROJECT_DESCRIPTION_INPUT}
                    />
                </ProjectDescriptionContainer>
            </TopGrid>

            <OptionButtons>
                <MultiselectList
                    selectedOptions={projectEnvironments}
                    options={activeEnvironments.map((env) => ({
                        label: env.name,
                        value: env.name,
                    }))}
                    onChange={setProjectEnvironments}
                    button={{
                        label:
                            projectEnvironments.size > 0
                                ? `${projectEnvironments.size} selected`
                                : 'Select environments',
                        icon: <EnvironmentsIcon />,
                    }}
                    search={{
                        label: 'Filter project environments',
                        placeholder: 'Select project environments',
                    }}
                    onOpen={() =>
                        overrideDocumentation(
                            `Each feature toggle can have a separate configuration per environment. This setting configures which environments your project should start with.`,
                        )
                    }
                    onClose={clearDocumentationOverride}
                />

                <SingleSelectList
                    options={stickinessOptions.map(({ key, ...rest }) => ({
                        value: key,
                        ...rest,
                    }))}
                    onChange={(value: any) => {
                        setProjectStickiness(value);
                    }}
                    button={{
                        label: projectStickiness,
                        icon: <StickinessIcon />,
                    }}
                    search={{
                        label: 'Filter stickiness options',
                        placeholder: 'Select default stickiness',
                    }}
                    onOpen={() =>
                        overrideDocumentation(
                            'Stickiness is used to guarantee that your users see the same result when using a gradual rollout. Default stickiness allows you to choose which field is used by default in this project.',
                        )
                    }
                    onClose={clearDocumentationOverride}
                />

                <ConditionallyRender
                    condition={isEnterprise()}
                    show={
                        <SingleSelectList
                            options={projectModeOptions}
                            onChange={(value: any) => {
                                setProjectMode(value);
                            }}
                            button={{
                                label: projectMode,
                                icon: <ProjectModeIcon />,
                            }}
                            search={{
                                label: 'Filter project mode options',
                                placeholder: 'Select project mode',
                            }}
                            onOpen={() =>
                                overrideDocumentation(
                                    'Mode defines who should be allowed to interact and see your project. Private mode hides the project from anyone except the project owner and members.',
                                )
                            }
                            onClose={clearDocumentationOverride}
                        />
                    }
                />
                <ConditionallyRender
                    condition={isEnterprise()}
                    show={
                        <TableSelect
                            disabled={projectEnvironments.size === 0}
                            activeEnvironments={activeEnvironments
                                .filter((env) =>
                                    projectEnvironments.has(env.name),
                                )
                                .map((env) => ({
                                    name: env.name,
                                    type: env.type,
                                }))}
                            updateProjectChangeRequestConfiguration={
                                updateProjectChangeRequestConfig
                            }
                            button={{
                                label:
                                    Object.keys(
                                        projectChangeRequestConfiguration,
                                    ).length > 0
                                        ? `${
                                              Object.keys(
                                                  projectChangeRequestConfiguration,
                                              ).length
                                          } selected`
                                        : 'Configure change requests',
                                icon: <ChangeRequestIcon />,
                            }}
                            search={{
                                label: 'Filter environments',
                                placeholder: 'Filter environments',
                            }}
                            projectChangeRequestConfiguration={
                                projectChangeRequestConfiguration
                            }
                            onOpen={() =>
                                overrideDocumentation(
                                    'Change requests can be configured per environment and require changes to go through an approval process before being applied.',
                                )
                            }
                            onClose={clearDocumentationOverride}
                        />
                    }
                />
            </OptionButtons>
            <FormActions>{children}</FormActions>
        </StyledForm>
    );
};
