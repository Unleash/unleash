import { formatUnknownError } from 'utils/formatUnknownError';
import EnvironmentsIcon from '@mui/icons-material/CloudCircle';
import StickinessIcon from '@mui/icons-material/FormatPaint';
import ProjectModeIcon from '@mui/icons-material/Adjust';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useToast from 'hooks/useToast';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import useProjectForm, {
    DEFAULT_PROJECT_STICKINESS,
} from '../../hooks/useProjectForm.ts';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { type ReactNode, useState, type FormEvent, useEffect } from 'react';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router-dom';
import { Dialog, styled } from '@mui/material';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { Limit } from 'component/common/Limit/Limit';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DialogFormTemplate } from 'component/common/DialogFormTemplate/DialogFormTemplate';
import { MultiSelectConfigButton } from 'component/common/DialogFormTemplate/ConfigButtons/MultiSelectConfigButton';
import { SingleSelectConfigButton } from 'component/common/DialogFormTemplate/ConfigButtons/SingleSelectConfigButton';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { useStickinessOptions } from 'hooks/useStickinessOptions';
import { ChangeRequestTableConfigButton } from './ConfigButtons/ChangeRequestTableConfigButton.tsx';
import { StyledDefinitionList } from './CreateProjectDialog.styles';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import { ChangeRequestIcon } from 'component/common/ChangeRequestIcon/ChangeRequestIcon.tsx';

interface ICreateProjectDialogProps {
    open: boolean;
    onClose: () => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(170),
        width: '100%',
        backgroundColor: 'transparent',
    },
    padding: 0,
    '& .MuiPaper-root > section': {
        overflowX: 'hidden',
    },
}));

const projectModeOptions = [
    { value: 'open', label: 'open' },
    { value: 'protected', label: 'protected' },
    { value: 'private', label: 'private' },
];

const configButtonData = {
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
        text: "A project's collaboration mode defines who should be allowed see your project and create change requests in it.",
        additionalTooltipContent: (
            <>
                <p>The modes and their functions are:</p>
                <StyledDefinitionList>
                    <dt>Open</dt>
                    <dd>
                        Anyone can see the project and anyone can create change
                        requests.
                    </dd>
                    <dt>Protected</dt>
                    <dd>
                        Anyone can see the project, but only admins and project
                        members can submit change requests.
                    </dd>
                    <dt>Private</dt>
                    <dd>
                        Hides the project from users with the "viewer" root role
                        who are not members of the project. Only project members
                        and admins can submit change requests.
                    </dd>
                </StyledDefinitionList>
            </>
        ),
    },
    changeRequests: {
        icon: <ChangeRequestIcon />,
        text: 'Change requests can be configured per environment and require changes to go through an approval process before being applied.',
    },
};

const useProjectLimit = () => {
    const { projects, loading: loadingProjects } = useProjects();
    const { uiConfig, loading: loadingConfig } = useUiConfig();
    const projectsLimit = uiConfig.resourceLimits?.projects;
    const limitReached = projects.length >= projectsLimit;

    return {
        limit: projectsLimit,
        currentValue: projects.length,
        limitReached,
        loading: loadingConfig || loadingProjects,
    };
};

export const CreateProjectDialog = ({
    open,
    onClose,
}: ICreateProjectDialogProps) => {
    const { createProject, loading: creatingProject } = useProjectApi();
    const { refetchUser } = useAuthUser();
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();
    const {
        projectName,
        projectDesc,
        projectMode,
        projectEnvironments,
        projectChangeRequestConfiguration,
        setProjectMode,
        setProjectName,
        setProjectDesc,
        setProjectEnvironments,
        updateProjectChangeRequestConfig,
        getCreateProjectPayload,
        clearErrors,
        validateName,
        setProjectStickiness,
        projectStickiness,
        errors,
    } = useProjectForm();

    const generalDocumentation: {
        icon: ReactNode;
        text: string;
        link?: { url: string; label: string };
    } = {
        icon: <ProjectIcon />,
        text: 'Projects allow you to group feature flags together in the management UI.',
        link: {
            url: 'https://docs.getunleash.io/reference/projects',
            label: 'Projects documentation',
        },
    };

    const [documentation, setDocumentation] = useState(generalDocumentation);

    const clearDocumentationOverride = () =>
        setDocumentation(generalDocumentation);

    const projectPayload = getCreateProjectPayload({
        omitId: true,
        includeChangeRequestConfig: true,
    });

    const formatApiCode = () => {
        return `curl --location --request POST '${uiConfig.unleashUrl}/api/admin/projects' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(projectPayload, undefined, 2)}'`;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearErrors();
        const validName = validateName();

        if (validName) {
            try {
                const createdProject = await createProject(projectPayload);
                refetchUser();
                navigate(`/projects/${createdProject.id}`);
                setToastData({
                    text: 'Project created',
                    type: 'success',
                });

                if (projectStickiness !== DEFAULT_PROJECT_STICKINESS) {
                    trackEvent('project_stickiness_set');
                }
                trackEvent('project-mode', {
                    props: { mode: projectMode, action: 'added' },
                });
                trackEvent('onboarding', {
                    props: { eventType: 'onboarding-started' },
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const {
        limit,
        currentValue,
        limitReached,
        loading: loadingLimit,
    } = useProjectLimit();

    const { isEnterprise } = useUiConfig();
    const { environments: allEnvironments } = useEnvironments();
    const activeEnvironments = allEnvironments.filter((env) => env.enabled);
    const stickinessOptions = useStickinessOptions(projectStickiness);

    const numberOfConfiguredChangeRequestEnvironments = Object.keys(
        projectChangeRequestConfiguration,
    ).length;
    const changeRequestSelectorLabel =
        numberOfConfiguredChangeRequestEnvironments > 1
            ? `${numberOfConfiguredChangeRequestEnvironments} environments configured`
            : numberOfConfiguredChangeRequestEnvironments === 1
              ? `1 environment  configured`
              : 'Configure change requests';

    const availableChangeRequestEnvironments = (
        projectEnvironments.size === 0
            ? activeEnvironments
            : activeEnvironments.filter((env) =>
                  projectEnvironments.has(env.name),
              )
    ).map(({ name, type, requiredApprovals }) => ({
        name,
        type,
        requiredApprovals,
        configurable: !Number.isInteger(requiredApprovals),
    }));

    useEffect(() => {
        availableChangeRequestEnvironments.forEach((environment) => {
            if (Number.isInteger(environment.requiredApprovals)) {
                updateProjectChangeRequestConfig.enableChangeRequests(
                    environment.name,
                    Number(environment.requiredApprovals),
                );
            }
        });
    }, [JSON.stringify(availableChangeRequestEnvironments)]);

    return (
        <StyledDialog open={open} onClose={onClose}>
            <FormTemplate
                compact
                disablePadding
                description={documentation.text}
                documentationIcon={documentation.icon}
                documentationLink={documentation.link?.url}
                documentationLinkLabel={documentation.link?.label}
                formatApiCode={formatApiCode}
                useFixedSidebar
            >
                <DialogFormTemplate
                    resource='project'
                    createButtonProps={{
                        permission: CREATE_PROJECT,
                        disabled:
                            creatingProject || limitReached || loadingLimit,
                    }}
                    Limit={
                        <Limit
                            name='projects'
                            limit={limit}
                            currentValue={currentValue}
                        />
                    }
                    handleSubmit={handleSubmit}
                    name={projectName}
                    setName={setProjectName}
                    description={projectDesc}
                    setDescription={setProjectDesc}
                    errors={errors}
                    Icon={<ProjectIcon />}
                    onClose={onClose}
                    validateName={validateName}
                    configButtons={
                        <>
                            <MultiSelectConfigButton
                                tooltip={{
                                    header: 'Select project environments',
                                }}
                                description={configButtonData.environments.text}
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
                                    setDocumentation(
                                        configButtonData.environments,
                                    )
                                }
                                onClose={clearDocumentationOverride}
                            />

                            <SingleSelectConfigButton
                                tooltip={{
                                    header: 'Set default project stickiness',
                                }}
                                description={configButtonData.stickiness.text}
                                options={stickinessOptions.map(
                                    ({ key, ...rest }) => ({
                                        value: key,
                                        ...rest,
                                    }),
                                )}
                                onChange={(value: any) => {
                                    setProjectStickiness(value);
                                }}
                                button={{
                                    label: projectStickiness,
                                    icon: <StickinessIcon />,
                                    labelWidth: '12ch',
                                }}
                                search={{
                                    label: 'Filter stickiness options',
                                    placeholder: 'Select default stickiness',
                                }}
                                onOpen={() =>
                                    setDocumentation(
                                        configButtonData.stickiness,
                                    )
                                }
                                onClose={clearDocumentationOverride}
                            />

                            <ConditionallyRender
                                condition={isEnterprise()}
                                show={
                                    <SingleSelectConfigButton
                                        tooltip={{
                                            header: 'Set project collaboration mode',
                                            additionalContent:
                                                configButtonData.mode
                                                    .additionalTooltipContent,
                                        }}
                                        description={configButtonData.mode.text}
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
                                            setDocumentation(
                                                configButtonData.mode,
                                            )
                                        }
                                        onClose={clearDocumentationOverride}
                                    />
                                }
                            />
                            <ConditionallyRender
                                condition={isEnterprise()}
                                show={
                                    <ChangeRequestTableConfigButton
                                        tooltip={{
                                            header: 'Configure change requests',
                                        }}
                                        description={
                                            configButtonData.changeRequests.text
                                        }
                                        activeEnvironments={
                                            availableChangeRequestEnvironments
                                        }
                                        updateProjectChangeRequestConfiguration={
                                            updateProjectChangeRequestConfig
                                        }
                                        button={{
                                            label: changeRequestSelectorLabel,
                                            icon: <ChangeRequestIcon />,
                                            labelWidth: `${
                                                'nn environments configured'
                                                    .length
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
                                            setDocumentation(
                                                configButtonData.changeRequests,
                                            )
                                        }
                                        onClose={clearDocumentationOverride}
                                    />
                                }
                            />
                        </>
                    }
                />
            </FormTemplate>
        </StyledDialog>
    );
};
