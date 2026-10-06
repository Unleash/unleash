import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { type ReactNode, type FormEvent, useMemo, useEffect } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useTracking } from 'hooks/useTracking';
import { useNavigate } from 'react-router';
import { Dialog, styled } from '@mui/material';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { Limit } from 'component/common/Limit/Limit';
import { CreateFeatureDialogSidebar } from './CreateFeatureDialogSidebar.tsx';
import useFeatureForm, {
    type FeatureFormInitialData,
} from 'component/feature/hooks/useFeatureForm';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import FlagIcon from '@mui/icons-material/Flag';
import ImpressionDataIcon from '@mui/icons-material/AltRoute';
import { useGlobalFeatureSearch } from 'component/feature/FeatureToggleList/useGlobalFeatureSearch';
import useProjectOverview, {
    featuresCount,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import type { FeatureTypeSchema } from 'openapi';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import {
    MultiPillDropdown,
    DialogFormTemplate,
    SinglePillDropdown,
} from 'component/common/DialogFormTemplate/DialogFormTemplate.tsx';
import useAllTags from 'hooks/api/getters/useAllTags/useAllTags';
import type { CreateFeatureDialogProps } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/CreateFeatureDialog.tsx';
import Label from '@mui/icons-material/Label';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import { useFlagLimits } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/useFlagLimits.tsx';
import { useFeatureCreatedFeedback } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/hooks/useFeatureCreatedFeedback.ts';
import { formatTag } from 'utils/format-tag';
import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';
import {
    type DialogDismissMethod,
    dismissMethodFromCloseReason,
    type Tracking,
    type TrackingProps,
} from 'utils/trackingEvents';

const createFlagTracking = {
    event: 'flag-creation',
    type: 'create-flag',
} satisfies Tracking;

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(128),
        width: '100%',
        backgroundColor: 'transparent',
    },
    padding: 0,
    '& .MuiPaper-root > section': {
        overflowX: 'hidden',
    },
}));

const configButtonData = {
    project: {
        icon: <ProjectIcon />,
        text: 'Projects allow you to group feature flags together in the Unleash admin UI and in SDK payloads.',
    },
    tags: {
        icon: <Label />,
        text: 'Tags are used to label flags, and can be used when filtering flags in the UI',
    },
    type: {
        icon: <FlagIcon />,
        text: "A flag's type conveys its purpose. All types have the same capabilities, but choosing the right type signals what kind of flag it is. You can change this at any time.",
    },

    impressionData: {
        icon: <ImpressionDataIcon />,
        text: `Impression data is used to track how your flag is performing. When enabled, you can subscribe to 'impression events' in the SDK and process them according to your needs.`,
    },
};

export const LegacyCreateFeatureForm = ({
    open,
    onClose,
    onSuccess,
}: CreateFeatureDialogProps) => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig, isOss } = useUiConfig();
    const navigate = useNavigate();
    const openFeatureCreatedFeedback = useFeatureCreatedFeedback();

    const [storedFlagConfig, setStoredFlagConfig] =
        useLocalStorageState<FeatureFormInitialData>(
            'flag-creation-dialog',
            {},
            60 * 60 * 1000, // <- 1 hour
        );

    const initialData = storedFlagConfig;

    const {
        type,
        setType,
        tags,
        setTags,
        name,
        setName,
        project,
        setProject,
        description,
        setDescription,
        validateToggleName,
        impressionData,
        setImpressionData,
        getTogglePayload,
        clearErrors,
        errors,
    } = useFeatureForm(initialData);
    const { createFeatureToggle, loading } = useFeatureApi();

    const documentation: {
        icon: ReactNode;
        text: string;
        link?: { url: string; label: string };
    } = {
        icon: <FlagIcon />,
        text: 'Feature flags are at the core of Unleash. Use them to control your feature rollouts.',
        link: {
            url: 'https://docs.getunleash.io/concepts/feature-flags',
            label: 'Feature flags documentation',
        },
    };

    const flagPayload = getTogglePayload();

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/projects/${project}/features' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(flagPayload, undefined, 2)}'`;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearErrors();
        const validToggleName = await validateToggleName();

        if (validToggleName) {
            const payload = getTogglePayload();
            try {
                await trackCreateFlag.mutation(() =>
                    createFeatureToggle(project, payload),
                );
                navigate(`/projects/${project}/features/${name}`);
                setToastData({
                    text: 'Flag created successfully',
                    type: 'success',
                });
                onClose();
                onSuccess?.();
                setStoredFlagConfig({});
                openFeatureCreatedFeedback();
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        } else {
            trackCreateFlag.validationFailed();
        }
    };

    const { total: totalFlags, loading: loadingTotalFlagCount } =
        useGlobalFeatureSearch(1);

    const { project: projectInfo } = useProjectOverview(project);
    const { tags: allTags } = useAllTags();

    const { globalFlagLimitReached, projectFlagLimitReached, limitMessage } =
        useFlagLimits({
            global: {
                limit: uiConfig.resourceLimits.featureFlags,
                count: totalFlags ?? 0,
            },
            project: {
                limit: projectInfo.featureLimit || undefined,
                count: featuresCount(projectInfo) ?? 0,
            },
        });

    const blockedProps: TrackingProps = globalFlagLimitReached
        ? { blockedBy: 'limit', scope: 'global' }
        : projectFlagLimitReached
          ? { blockedBy: 'limit', scope: 'project' }
          : {};
    const trackCreateFlag = useTracking({
        ...createFlagTracking,
        props: blockedProps,
    });

    useEffect(() => {
        if (open) {
            trackCreateFlag('opened');
        }
    }, [open, trackCreateFlag]);

    const { projects } = useProjects();
    const { featureTypes } = useFeatureTypes();

    const currentProjectName = useMemo(() => {
        const projectObject = projects.find(
            (projectOption) => projectOption.id === project,
        );
        return projectObject?.name;
    }, [project, projects]);

    const onDialogClose = (method: DialogDismissMethod) => {
        trackCreateFlag('dismissed', { method });
        setStoredFlagConfig({
            name,
            tags,
            impressionData,
            type,
            description,
        });
        onClose();
    };

    const createButtonProps = {
        projectId: project,
        disabled:
            loading ||
            loadingTotalFlagCount ||
            globalFlagLimitReached ||
            projectFlagLimitReached,
        permission: CREATE_FEATURE,
        tooltipProps: { title: limitMessage, arrow: true },
    };

    const limitNode = (
        <Limit
            name='feature flags'
            limit={uiConfig.resourceLimits.featureFlags}
            currentValue={totalFlags ?? 0}
        />
    );

    return (
        <StyledDialog
            open={open}
            onClose={(_, reason) =>
                onDialogClose(dismissMethodFromCloseReason(reason))
            }
        >
            <FormTemplate
                compact
                disablePadding
                description={documentation.text}
                documentationIcon={documentation.icon}
                documentationLink={documentation.link?.url}
                documentationLinkLabel={documentation.link?.label}
                formatApiCode={formatApiCode}
                useFixedSidebar
                sidebar={
                    <CreateFeatureDialogSidebar
                        apiCommand={formatApiCode()}
                        onClose={() => onDialogClose('close-icon')}
                    />
                }
            >
                <DialogFormTemplate
                    title='New feature flag'
                    resource='feature flag'
                    projects={projects.map((projectOption) => ({
                        label: projectOption.name,
                        value: projectOption.id,
                    }))}
                    project={project}
                    currentProjectName={currentProjectName}
                    onProjectChange={setProject}
                    hideProjectSelector={isOss()}
                    name={name}
                    setName={setName}
                    description={description}
                    setDescription={setDescription}
                    errors={errors}
                    validateName={validateToggleName}
                    namingPattern={projectInfo.featureNaming}
                    impressionData={impressionData}
                    setImpressionData={setImpressionData}
                    impressionDataHelp={configButtonData.impressionData.text}
                    handleSubmit={handleSubmit}
                    onClose={() => onDialogClose('cancel-button')}
                    createButtonProps={createButtonProps}
                    Limit={limitNode}
                    configButtons={
                        <>
                            <SinglePillDropdown<string>
                                label={
                                    featureTypes.find(
                                        (featureType) =>
                                            featureType.id === type,
                                    )?.name || 'Select flag type'
                                }
                                selectedValue={type}
                                hideSearch
                                tooltip={{
                                    header: 'Select a flag type',
                                }}
                                options={featureTypes.map(
                                    (featureType: FeatureTypeSchema) => ({
                                        label: featureType.name,
                                        value: featureType.id,
                                        description: featureType.description,
                                    }),
                                )}
                                onChange={(value) =>
                                    setType(value as typeof type)
                                }
                                searchLabel='Filter flag types'
                                searchPlaceholder='Select flag type'
                            />
                            <MultiPillDropdown<string>
                                label={
                                    tags.size > 0
                                        ? `${tags.size} tag${tags.size > 1 ? 's' : ''} selected`
                                        : 'Add tags'
                                }
                                tooltip={{
                                    header: 'Select tags',
                                    description: configButtonData.tags.text,
                                }}
                                options={allTags.map((tag) => ({
                                    label: formatTag(tag),
                                    value: `${tag.type}:${tag.value}`,
                                }))}
                                selectedOptions={
                                    new Set(
                                        Array.from(tags).map(
                                            (tag) => `${tag.type}:${tag.value}`,
                                        ),
                                    )
                                }
                                onChange={(tagStrings) => {
                                    const normalized = Array.from(
                                        tagStrings,
                                    ).map((tagString) => {
                                        const [tagType, value] =
                                            tagString.split(':');
                                        return { type: tagType, value };
                                    });
                                    setTags(new Set(normalized));
                                }}
                                searchLabel='Filter tags'
                                searchPlaceholder='Select tags'
                            />
                        </>
                    }
                />
            </FormTemplate>
        </StyledDialog>
    );
};
