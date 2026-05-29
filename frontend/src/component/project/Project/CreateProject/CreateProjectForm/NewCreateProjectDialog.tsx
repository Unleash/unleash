import {
    type FC,
    type FormEvent,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    FormControlLabel,
    IconButton,
    InputAdornment,
    styled,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import copy from 'copy-to-clipboard';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useStickinessOptions } from 'hooks/useStickinessOptions';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { ApiCommandBlock } from 'component/common/FormTemplate/ApiCommandBlock';
import { Limit } from 'component/common/Limit/Limit';
import Input from 'component/common/Input/Input';
import {
    descriptionInputSlotProps,
    MultiPillDropdown,
    nameInputSlotProps,
    SinglePillDropdown,
} from 'component/common/DialogFormTemplate/NewDialogFormTemplate';
import { StyledPopover } from 'component/common/DialogFormTemplate/ConfigButtons/shared.styles';
import useProjectForm, {
    DEFAULT_PROJECT_STICKINESS,
} from '../../hooks/useProjectForm.ts';
import { ChangeRequestTable } from './ConfigButtons/ChangeRequestTable.tsx';
import {
    ScrollContainer,
    TableSearchInput,
} from './ConfigButtons/ChangeRequestTableConfigButton.styles';
import Search from '@mui/icons-material/Search';

type Props = {
    open: boolean;
    onClose: () => void;
};

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

const StyledNewSidebarHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: theme.spacing(8),
    margin: theme.spacing(-4, -4, 0, -4),
    padding: theme.spacing(0, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    boxSizing: 'border-box',
    [theme.breakpoints.down(500)]: {
        margin: theme.spacing(-4, -2, 0, -2),
    },
}));

const StyledNewSidebarCloseButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.common.white,
}));

const StyledNewSidebarLinkContainer = styled('div')(({ theme }) => ({
    margin: theme.spacing(3, 0),
    display: 'flex',
    alignItems: 'center',
    width: '100%',
}));

const StyledNewSidebarLinkIcon = styled(MenuBookIcon)(({ theme }) => ({
    marginRight: theme.spacing(1),
    color: theme.palette.primary.contrastText,
}));

const StyledNewSidebarLink = styled('a')(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    display: 'block',
    '&:hover': {
        textDecoration: 'none',
    },
}));

const StyledForm = styled('form')(({ theme }) => ({
    background: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
}));

const TitleBar = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    height: theme.spacing(8),
    fontWeight: theme.typography.body1.fontWeight,
}));

const Section = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 4),
}));

const projectModeOptions = [
    { value: 'open', label: 'open' },
    { value: 'protected', label: 'protected' },
    { value: 'private', label: 'private' },
];

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

type ChangeRequestCheckboxPopoverProps = {
    activeEnvironments: {
        name: string;
        type: string;
        requiredApprovals: number | null | undefined;
        configurable: boolean;
    }[];
    projectChangeRequestConfiguration: Record<
        string,
        { requiredApprovals: number }
    >;
    updateProjectChangeRequestConfiguration: {
        disableChangeRequests: (env: string) => void;
        enableChangeRequests: (env: string, requiredApprovals: number) => void;
    };
};

const ChangeRequestCheckboxPopover: FC<ChangeRequestCheckboxPopoverProps> = ({
    activeEnvironments,
    projectChangeRequestConfiguration,
    updateProjectChangeRequestConfiguration,
}) => {
    const ref = useRef<HTMLLabelElement>(null);
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [searchText, setSearchText] = useState('');

    const enabledCount = Object.keys(projectChangeRequestConfiguration).length;
    const checked = enabledCount > 0;

    const configured = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(projectChangeRequestConfiguration).map(
                    ([name, config]) => [
                        name,
                        { ...config, changeRequestEnabled: true },
                    ],
                ),
            ),
        [projectChangeRequestConfiguration],
    );

    const tableEnvs = useMemo(
        () =>
            activeEnvironments.map(({ name, type, configurable }) => ({
                name,
                type,
                configurable,
                ...(configured[name] ?? {
                    changeRequestEnabled: false,
                    requiredApprovals: 1,
                }),
            })),
        [configured, activeEnvironments],
    );

    const filteredEnvs = tableEnvs.filter((env) =>
        env.name.toLowerCase().includes(searchText.toLowerCase()),
    );

    const onEnable = (name: string, requiredApprovals: number) =>
        updateProjectChangeRequestConfiguration.enableChangeRequests(
            name,
            requiredApprovals,
        );
    const onDisable = (name: string) =>
        updateProjectChangeRequestConfiguration.disableChangeRequests(name);

    const toggleTopItem = (event: React.KeyboardEvent) => {
        if (
            event.key === 'Enter' &&
            searchText.trim().length > 0 &&
            filteredEnvs.length > 0
        ) {
            const firstEnv = filteredEnvs[0];
            if (firstEnv.name in configured) {
                onDisable(firstEnv.name);
            } else {
                onEnable(firstEnv.name, 1);
            }
        }
    };

    const openPopover = () => setAnchor(ref.current);

    return (
        <>
            <FormControlLabel
                ref={ref}
                sx={{ m: 0 }}
                control={
                    <Checkbox
                        size='small'
                        checked={checked}
                        onChange={openPopover}
                        onClick={openPopover}
                    />
                }
                label='Enable change request'
            />
            <StyledPopover
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <TableSearchInput
                    variant='outlined'
                    size='small'
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    hideLabel
                    label='Filter environments'
                    placeholder='Filter environments'
                    autoFocus
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <Search fontSize='small' />
                                </InputAdornment>
                            ),
                        },
                    }}
                    onKeyDown={toggleTopItem}
                />
                <ScrollContainer>
                    <ChangeRequestTable
                        environments={filteredEnvs}
                        enableEnvironment={onEnable}
                        disableEnvironment={onDisable}
                    />
                </ScrollContainer>
            </StyledPopover>
        </>
    );
};

export const NewCreateProjectDialog: FC<Props> = ({ open, onClose }) => {
    if (!open) return null;
    return <NewCreateProjectDialogContent open={open} onClose={onClose} />;
};

const NewCreateProjectDialogContent: FC<Props> = ({ open, onClose }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig, isEnterprise } = useUiConfig();
    const { createProject, loading: creatingProject } = useProjectApi();
    const { refetchUser } = useAuthUser();
    const { trackEvent } = usePlausibleTracker();

    const {
        projectName,
        projectDesc,
        projectMode,
        projectEnvironments,
        projectChangeRequestConfiguration,
        projectStickiness,
        setProjectMode,
        setProjectName,
        setProjectDesc,
        setProjectEnvironments,
        setProjectStickiness,
        updateProjectChangeRequestConfig,
        getCreateProjectPayload,
        clearErrors,
        validateName,
        errors,
    } = useProjectForm();
    const formErrors = errors as { name?: string };

    const { environments: allEnvironments } = useEnvironments();
    const activeEnvironments = allEnvironments.filter((env) => env.enabled);
    const stickinessOptions = useStickinessOptions(projectStickiness);
    const {
        limit,
        currentValue,
        limitReached,
        loading: loadingLimit,
    } = useProjectLimit();

    const projectPayload = getCreateProjectPayload({
        omitId: true,
        includeChangeRequestConfig: true,
    });

    const formatApiCode = () =>
        `curl --location --request POST '${uiConfig.unleashUrl}/api/admin/projects' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(projectPayload, undefined, 2)}'`;

    const copyApiCommand = () => {
        if (copy(formatApiCode())) {
            setToastData({ text: 'Command copied', type: 'success' });
        } else {
            setToastData({ text: 'Could not copy the command', type: 'error' });
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearErrors();
        if (!validateName()) return;
        try {
            const createdProject = await createProject(projectPayload);
            refetchUser();
            navigate(`/projects/${createdProject.id}`);
            setToastData({ text: 'Project created', type: 'success' });
            if (projectStickiness !== DEFAULT_PROJECT_STICKINESS) {
                trackEvent('project_stickiness_set');
            }
            trackEvent('project-mode', {
                props: { mode: projectMode, action: 'added' },
            });
            trackEvent('onboarding', {
                props: { eventType: 'onboarding-started' },
            });
            onClose();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    // Auto-enable change requests for environments that already require approvals
    // (mirrors the legacy modal's behavior).
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

    const stickinessLabel =
        stickinessOptions.find((option) => option.key === projectStickiness)
            ?.label ?? projectStickiness;

    const projectModeLabel =
        projectModeOptions.find((option) => option.value === projectMode)
            ?.label ?? projectMode;

    const sidebar: ReactNode = (
        <>
            <StyledNewSidebarHeader>
                <StyledNewSidebarCloseButton
                    onClick={onClose}
                    size='small'
                    aria-label='Close'
                >
                    <CloseIcon />
                </StyledNewSidebarCloseButton>
            </StyledNewSidebarHeader>
            <StyledNewSidebarLinkContainer>
                <StyledNewSidebarLinkIcon />
                <StyledNewSidebarLink
                    href='https://docs.getunleash.io/reference/projects'
                    rel='noopener noreferrer'
                    target='_blank'
                >
                    Projects documentation
                </StyledNewSidebarLink>
            </StyledNewSidebarLinkContainer>
            <ApiCommandBlock
                command={formatApiCode()}
                onCopy={copyApiCommand}
                hideDivider
            />
        </>
    );

    return (
        <StyledDialog open={open} onClose={onClose}>
            <FormTemplate
                compact
                disablePadding
                description=''
                formatApiCode={formatApiCode}
                useFixedSidebar
                sidebar={sidebar}
            >
                <StyledForm onSubmit={handleSubmit}>
                    <TitleBar>New project</TitleBar>

                    <Section sx={{ pt: 4, pb: 3, width: '100%' }}>
                        <Input
                            label='Project name'
                            placeholder='Project name'
                            value={projectName}
                            onChange={(event) =>
                                setProjectName(event.target.value)
                            }
                            error={Boolean(formErrors.name)}
                            errorText={formErrors.name}
                            onFocus={() => clearErrors()}
                            autoFocus
                            slotProps={nameInputSlotProps(theme)}
                            data-testid='PROJECT_FORM_NAME_INPUT'
                            fullWidth
                            size='medium'
                        />
                    </Section>

                    <Section sx={{ pb: 4, width: '100%' }}>
                        <Input
                            label='Description (optional)'
                            placeholder='Description (optional)'
                            multiline
                            maxRows={3}
                            value={projectDesc}
                            onChange={(event) =>
                                setProjectDesc(event.target.value)
                            }
                            slotProps={descriptionInputSlotProps(theme)}
                            data-testid='PROJECT_FORM_DESCRIPTION_INPUT'
                            fullWidth
                            size='medium'
                        />
                    </Section>

                    <Section
                        sx={{
                            display: 'flex',
                            gap: 2,
                            flexFlow: 'row wrap',
                            pb: 3,
                        }}
                    >
                        <MultiPillDropdown<string>
                            label={
                                projectEnvironments.size > 0
                                    ? `${projectEnvironments.size} environments`
                                    : 'All environments'
                            }
                            tooltip={{
                                header: 'Select project environments',
                                description:
                                    'Each feature flag can have a separate configuration per environment. This setting configures which environments your project should start with.',
                            }}
                            options={activeEnvironments.map((env) => ({
                                label: env.name,
                                value: env.name,
                            }))}
                            selectedOptions={projectEnvironments}
                            onChange={setProjectEnvironments}
                            searchLabel='Filter project environments'
                            searchPlaceholder='Select project environments'
                        />

                        <SinglePillDropdown<string>
                            label={stickinessLabel}
                            tooltip={{
                                header: 'Set default project stickiness',
                                description:
                                    'Stickiness is used to guarantee that your users see the same result when using a gradual rollout. Default stickiness allows you to choose which field is used by default in this project.',
                            }}
                            options={stickinessOptions.map(
                                ({ key, label }) => ({
                                    value: key,
                                    label,
                                }),
                            )}
                            onChange={(value) => setProjectStickiness(value)}
                            searchLabel='Filter stickiness options'
                            searchPlaceholder='Select default stickiness'
                        />

                        {isEnterprise() ? (
                            <SinglePillDropdown<string>
                                label={`${projectModeLabel} project`}
                                tooltip={{
                                    header: 'Set project collaboration mode',
                                    description:
                                        "A project's collaboration mode defines who can see your project and create change requests in it.",
                                }}
                                options={projectModeOptions}
                                onChange={(value) =>
                                    setProjectMode(value as typeof projectMode)
                                }
                                searchLabel='Filter project mode options'
                                searchPlaceholder='Select project mode'
                            />
                        ) : null}
                    </Section>

                    {isEnterprise() ? (
                        <Section sx={{ pb: 3 }}>
                            <ChangeRequestCheckboxPopover
                                activeEnvironments={
                                    availableChangeRequestEnvironments
                                }
                                projectChangeRequestConfiguration={
                                    projectChangeRequestConfiguration
                                }
                                updateProjectChangeRequestConfiguration={
                                    updateProjectChangeRequestConfig
                                }
                            />
                        </Section>
                    ) : null}

                    <Box sx={{ flex: 1 }} />

                    {limit !== undefined ? (
                        <Section sx={{ pb: 2 }}>
                            <Limit
                                name='projects'
                                limit={limit}
                                currentValue={currentValue}
                            />
                        </Section>
                    ) : null}

                    <Section
                        sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            pt: 2,
                            pb: 3,
                        }}
                    >
                        <Button onClick={onClose}>Cancel</Button>
                        <CreateButton
                            data-testid='PROJECT_FORM_CREATE_BUTTON'
                            name='project'
                            permission={CREATE_PROJECT}
                            disabled={
                                creatingProject || limitReached || loadingLimit
                            }
                        />
                    </Section>
                </StyledForm>
            </FormTemplate>
        </StyledDialog>
    );
};
