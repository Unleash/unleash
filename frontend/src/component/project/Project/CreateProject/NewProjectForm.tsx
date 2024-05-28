import { Typography, styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import type { ProjectMode } from '../hooks/useProjectEnterpriseSettingsForm';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIconSmall.svg';
import {
    MultiSelectList,
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
import type { ReactNode } from 'react';
import theme from 'themes/theme';

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
    gap: theme.spacing(4),
}));

const StyledIcon = styled(ProjectIcon)(({ theme }) => ({
    fill: theme.palette.primary.main,
    stroke: theme.palette.primary.main,
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

const OptionButtons = styled(StyledFormSection)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(2),
}));

const FormActions = styled(StyledFormSection)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(5),
    justifyContent: 'flex-end',
    flexFlow: 'row wrap',
}));

type FormProps = {
    projectId: string;
    projectName: string;
    projectDesc: string;
    projectStickiness: string;
    projectMode: string;
    projectEnvironments: Set<string>;
    projectChangeRequestConfiguration: Record<
        string,
        { requiredApprovals: number }
    >;
    setProjectStickiness: React.Dispatch<React.SetStateAction<string>>;
    setProjectEnvironments: (envs: Set<string>) => void;
    setProjectName: React.Dispatch<React.SetStateAction<string>>;
    setProjectDesc: React.Dispatch<React.SetStateAction<string>>;
    setProjectMode: React.Dispatch<React.SetStateAction<ProjectMode>>;
    updateProjectChangeRequestConfig: {
        disableChangeRequests: (env: string) => void;
        enableChangeRequests: (env: string, requiredApprovals: number) => void;
    };
    handleSubmit: (e: any) => void;
    errors: { [key: string]: string };
    overrideDocumentation: (args: { text: string; icon: ReactNode }) => void;
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
    projectMode,
    setProjectMode,
    setProjectEnvironments,
    setProjectName,
    setProjectDesc,
    setProjectStickiness,
    updateProjectChangeRequestConfig,
    errors,
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
    };

    const projectModeOptions = [
        { value: 'open', label: 'open' },
        { value: 'protected', label: 'protected' },
        { value: 'private', label: 'private' },
    ];

    const stickinessOptions = useStickinessOptions(projectStickiness);

    const selectionButtonData = {
        environments: {
            icon: <EnvironmentsIcon />,
            text: `Each feature flag can have a separate configuration per environment. This setting configures which environments your project should start with.`,
        },
        stickiness: {
            icon: <StickinessIcon />,
            text: 'Stickiness is used to guarantee that your users see the same result when using a gradual rollout. Default stickiness allows you to choose which field is used by default in this project.',
        },
        mode: {
            icon: <ProjectModeIcon />,
            text: 'Mode defines who should be allowed to interact and see your project. Private mode hides the project from anyone except the project owner and members.',
        },
        changeRequests: {
            icon: <ChangeRequestIcon />,
            text: 'Change requests can be configured per environment and require changes to go through an approval process before being applied.',
        },
    };

    const numberOfConfiguredChangeRequestEnvironments = Object.keys(
        projectChangeRequestConfiguration,
    ).length;
    const changeRequestSelectorLabel =
        numberOfConfiguredChangeRequestEnvironments > 1
            ? `${numberOfConfiguredChangeRequestEnvironments} environments configured`
            : numberOfConfiguredChangeRequestEnvironments === 1
              ? `1 environment  configured`
              : 'Configure change requests';
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
                    <StyledInput
                        label='Project name'
                        aria-required
                        value={projectName}
                        onChange={handleProjectNameUpdate}
                        error={Boolean(errors.name)}
                        errorText={errors.name}
                        onFocus={() => {
                            delete errors.name;
                        }}
                        data-testid={PROJECT_NAME_INPUT}
                        autoFocus
                        InputProps={{
                            style: { fontSize: theme.typography.h1.fontSize },
                        }}
                        InputLabelProps={{
                            style: { fontSize: theme.typography.h1.fontSize },
                        }}
                        size='medium'
                    />
                </ProjectNameContainer>
                <ProjectDescriptionContainer>
                    <StyledInput
                        size='medium'
                        className='description'
                        label='Description (optional)'
                        multiline
                        maxRows={3}
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        data-testid={PROJECT_DESCRIPTION_INPUT}
                        InputProps={{
                            style: { fontSize: theme.typography.h2.fontSize },
                        }}
                        InputLabelProps={{
                            style: { fontSize: theme.typography.h2.fontSize },
                        }}
                    />
                </ProjectDescriptionContainer>
            </TopGrid>

            <OptionButtons>
                <MultiSelectList
                    description={selectionButtonData.environments.text}
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
                                : 'All environments',
                        labelWidth: `${'all environments'.length}ch`,
                        icon: <EnvironmentsIcon />,
                    }}
                    search={{
                        label: 'Filter project environments',
                        placeholder: 'Select project environments',
                    }}
                    onOpen={() =>
                        overrideDocumentation(selectionButtonData.environments)
                    }
                    onClose={clearDocumentationOverride}
                />

                <SingleSelectList
                    description={selectionButtonData.stickiness.text}
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
                        overrideDocumentation(selectionButtonData.stickiness)
                    }
                    onClose={clearDocumentationOverride}
                />

                <ConditionallyRender
                    condition={isEnterprise()}
                    show={
                        <SingleSelectList
                            description={selectionButtonData.mode.text}
                            options={projectModeOptions}
                            onChange={(value: any) => {
                                setProjectMode(value);
                            }}
                            button={{
                                label: projectMode,
                                icon: <ProjectModeIcon />,
                                labelWidth: `${`protected`.length}ch`,
                            }}
                            search={{
                                label: 'Filter project mode options',
                                placeholder: 'Select project mode',
                            }}
                            onOpen={() =>
                                overrideDocumentation(selectionButtonData.mode)
                            }
                            onClose={clearDocumentationOverride}
                        />
                    }
                />
                <ConditionallyRender
                    condition={isEnterprise()}
                    show={
                        <TableSelect
                            description={
                                selectionButtonData.changeRequests.text
                            }
                            disabled={projectEnvironments.size === 0}
                            activeEnvironments={activeEnvironments
                                .filter((env) =>
                                    projectEnvironments.size > 0
                                        ? projectEnvironments.has(env.name)
                                        : true,
                                )
                                .map((env) => ({
                                    name: env.name,
                                    type: env.type,
                                }))}
                            updateProjectChangeRequestConfiguration={
                                updateProjectChangeRequestConfig
                            }
                            button={{
                                label: changeRequestSelectorLabel,
                                icon: <ChangeRequestIcon />,
                                labelWidth: `${
                                    'nn environments configured'.length
                                }ch`,
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
                                    selectionButtonData.changeRequests,
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
