import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { type ReactNode, useState, type FormEvent, useMemo } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useNavigate } from 'react-router-dom';
import { Dialog, styled } from '@mui/material';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { Limit } from 'component/common/Limit/Limit';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
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
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { DialogFormTemplate } from 'component/common/DialogFormTemplate/DialogFormTemplate';
import { NewDialogFormTemplate } from 'component/common/DialogFormTemplate/NewDialogFormTemplate';
import { SingleSelectConfigButton } from 'component/common/DialogFormTemplate/ConfigButtons/SingleSelectConfigButton';
import useAllTags from 'hooks/api/getters/useAllTags/useAllTags';
import Label from '@mui/icons-material/Label';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import { MultiSelectConfigButton } from 'component/common/DialogFormTemplate/ConfigButtons/MultiSelectConfigButton';
import { ToggleConfigButton } from 'component/common/DialogFormTemplate/ConfigButtons/ToggleConfigButton';
import { useFlagLimits } from './useFlagLimits.tsx';
import { useFeatureCreatedFeedback } from './hooks/useFeatureCreatedFeedback.ts';
import { formatTag } from 'utils/format-tag';
import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';

interface ICreateFeatureDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
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

const configButtonData = {
    project: {
        icon: <ProjectIcon />,
        text: 'Projects allow you to group feature flags together in the Unleash admin UI and in SDK payloads.',
    },
    tags: {
        icon: <Label />,
        text: 'Tags are used to label flags in Unleash. They can be used when filtering flags in the UI. Additionally, they are used by some integrations.',
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

export const CreateFeatureDialog = ({
    open,
    onClose,
    onSuccess,
}: ICreateFeatureDialogProps) => {
    if (!open) return null;
    // wrap the inner component so that we only fetch data etc
    // when the dialog is actually open.
    return (
        <CreateFeatureDialogContent
            open={open}
            onClose={onClose}
            onSuccess={onSuccess}
        />
    );
};

const CreateFeatureDialogContent = ({
    open,
    onClose,
    onSuccess,
}: ICreateFeatureDialogProps) => {
    const useNewDesign = true; //useUiFlag('newFeatureFlag');
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
    } = useFeatureForm(storedFlagConfig);
    const { createFeatureToggle, loading } = useFeatureApi();

    const generalDocumentation: {
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

    const [documentation, setDocumentation] = useState(generalDocumentation);
    const clearDocumentationOverride = () =>
        setDocumentation(generalDocumentation);

    const flagPayload = getTogglePayload();

    const formatApiCode = () =>
        `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/projects/${project}/features' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(flagPayload, undefined, 2)}'`;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearErrors();
        const validToggleName = await validateToggleName();
        if (!validToggleName) return;
        try {
            await createFeatureToggle(project, getTogglePayload());
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
    };

    const { total: totalFlags, loading: loadingTotalFlagCount } =
        useGlobalFeatureSearch(1);
    const { project: projectInfo } = useProjectOverview(project);
    const { tags: allTags } = useAllTags();
    const { projects } = useProjects();
    const { featureTypes } = useFeatureTypes();
    const FeatureTypeIcon = getFeatureTypeIcons(type);

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

    const longestFeatureTypeName = featureTypes.reduce(
        (prev: number, type: { name: string }) =>
            prev >= type.name.length ? prev : type.name.length,
        0,
    );

    const currentProjectName = useMemo(() => {
        const projectObject = projects.find((p) => p.id === project);
        return projectObject?.name;
    }, [project, projects]);

    const onDialogClose = () => {
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
        <StyledDialog open={open} onClose={onDialogClose}>
            <FormTemplate
                compact
                disablePadding
                showDescription={!useNewDesign}
                description={useNewDesign ? '' : documentation.text}
                documentationIcon={
                    useNewDesign ? undefined : documentation.icon
                }
                documentationLink={
                    useNewDesign
                        ? 'https://docs.getunleash.io/concepts/feature-flags'
                        : documentation.link?.url
                }
                documentationLinkLabel={
                    useNewDesign
                        ? 'Feature flags documentation'
                        : documentation.link?.label
                }
                formatApiCode={formatApiCode}
                useFixedSidebar
                onClose={useNewDesign ? onDialogClose : undefined}
            >
                {useNewDesign ? (
                    <NewDialogFormTemplate
                        title='New feature flag'
                        resource='feature flag'
                        projects={projects.map((p) => ({
                            label: p.name,
                            value: p.id,
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
                        impressionDataHelp={
                            configButtonData.impressionData.text
                        }
                        handleSubmit={handleSubmit}
                        onClose={onDialogClose}
                        createButtonProps={createButtonProps}
                        Limit={limitNode}
                        configButtons={
                            <>
                                <SingleSelectConfigButton
                                    variant='pill'
                                    tooltip={{ header: 'Select a flag type' }}
                                    description={configButtonData.type.text}
                                    options={featureTypes.map(
                                        (t: FeatureTypeSchema) => ({
                                            label: t.name,
                                            value: t.id,
                                        }),
                                    )}
                                    onChange={(value: any) => setType(value)}
                                    button={{
                                        label:
                                            featureTypes.find(
                                                (t) => t.id === type,
                                            )?.name || 'Select flag type',
                                        icon: <FeatureTypeIcon />,
                                    }}
                                    search={{
                                        label: 'Filter flag types',
                                        placeholder: 'Select flag type',
                                    }}
                                />
                                <MultiSelectConfigButton
                                    variant='pill'
                                    tooltip={{ header: 'Select tags' }}
                                    description={configButtonData.tags.text}
                                    selectedOptions={
                                        new Set(
                                            Array.from(tags).map(
                                                (tag) =>
                                                    `${tag.type}:${tag.value}`,
                                            ),
                                        )
                                    }
                                    options={allTags.map((tag) => ({
                                        label: formatTag(tag),
                                        value: `${tag.type}:${tag.value}`,
                                    }))}
                                    onChange={(strings) => {
                                        const normalized = Array.from(
                                            strings,
                                        ).map((s) => {
                                            const [tagType, value] =
                                                s.split(':');
                                            return { type: tagType, value };
                                        });
                                        setTags(new Set(normalized));
                                    }}
                                    button={{
                                        label:
                                            tags.size > 0
                                                ? `${tags.size} selected`
                                                : 'Add tags',
                                        icon: <Label />,
                                    }}
                                    search={{
                                        label: 'Filter tags',
                                        placeholder: 'Select tags',
                                    }}
                                />
                            </>
                        }
                    />
                ) : (
                    <DialogFormTemplate
                        createButtonProps={createButtonProps}
                        description={description}
                        namingPattern={projectInfo.featureNaming}
                        errors={errors}
                        handleSubmit={handleSubmit}
                        Icon={<FlagIcon />}
                        validateName={validateToggleName}
                        Limit={limitNode}
                        name={name}
                        onClose={onClose}
                        resource={'feature flag'}
                        setDescription={setDescription}
                        setName={setName}
                        configButtons={
                            <>
                                <ConditionallyRender
                                    condition={!isOss()}
                                    show={
                                        <SingleSelectConfigButton
                                            tooltip={{
                                                header: 'Select a project for the flag',
                                            }}
                                            description={
                                                configButtonData.project.text
                                            }
                                            options={projects.map(
                                                (project) => ({
                                                    label: project.name,
                                                    value: project.id,
                                                }),
                                            )}
                                            onChange={(value: any) => {
                                                setProject(value);
                                            }}
                                            button={{
                                                label:
                                                    currentProjectName ??
                                                    project,
                                                icon: configButtonData.project
                                                    .icon,
                                                labelWidth: '20ch',
                                            }}
                                            search={{
                                                label: 'Filter projects',
                                                placeholder: 'Select project',
                                            }}
                                            onOpen={() =>
                                                setDocumentation(
                                                    configButtonData.project,
                                                )
                                            }
                                            onClose={clearDocumentationOverride}
                                        />
                                    }
                                />
                                <MultiSelectConfigButton
                                    tooltip={{ header: 'Select tags' }}
                                    description={configButtonData.tags.text}
                                    selectedOptions={
                                        new Set(
                                            Array.from(tags).map(
                                                (tag) =>
                                                    `${tag.type}:${tag.value}`,
                                            ),
                                        )
                                    }
                                    options={allTags.map((tag) => ({
                                        label: formatTag(tag),
                                        value: `${tag.type}:${tag.value}`,
                                    }))}
                                    onChange={(strings) => {
                                        const normalized = Array.from(
                                            strings,
                                        ).map((string) => {
                                            const [type, value] =
                                                string.split(':');
                                            return { type, value };
                                        });
                                        setTags(new Set(normalized));
                                    }}
                                    button={{
                                        label:
                                            tags.size > 0
                                                ? `${tags.size} selected`
                                                : 'Tags',
                                        labelWidth: `${'nn selected'.length}ch`,
                                        icon: <Label />,
                                    }}
                                    search={{
                                        label: 'Filter tags',
                                        placeholder: 'Select tags',
                                    }}
                                    onOpen={() =>
                                        setDocumentation(configButtonData.tags)
                                    }
                                    onClose={clearDocumentationOverride}
                                />
                                <SingleSelectConfigButton
                                    tooltip={{ header: 'Select a flag type' }}
                                    description={configButtonData.type.text}
                                    options={featureTypes.map(
                                        (type: FeatureTypeSchema) => ({
                                            label: type.name,
                                            value: type.id,
                                        }),
                                    )}
                                    onChange={(value: any) => {
                                        setType(value);
                                    }}
                                    button={{
                                        label:
                                            featureTypes.find(
                                                (t) => t.id === type,
                                            )?.name || 'Select flag type',
                                        icon: <FeatureTypeIcon />,
                                        labelWidth: `${longestFeatureTypeName}ch`,
                                    }}
                                    search={{
                                        label: 'Filter flag types',
                                        placeholder: 'Select flag type',
                                    }}
                                    onOpen={() =>
                                        setDocumentation({
                                            text: configButtonData.type.text,
                                            icon: <FeatureTypeIcon />,
                                        })
                                    }
                                    onClose={clearDocumentationOverride}
                                />
                                <ToggleConfigButton
                                    tooltip={{
                                        header: 'Enable or disable impression data',
                                        description:
                                            configButtonData.impressionData
                                                .text,
                                    }}
                                    currentValue={impressionData}
                                    onClick={() =>
                                        setImpressionData(!impressionData)
                                    }
                                    label={`Impression data ${impressionData ? 'on' : 'off'}`}
                                    icon={<ImpressionDataIcon />}
                                    labelWidth={`${'impression data off'.length}ch`}
                                />
                            </>
                        }
                    />
                )}
            </FormTemplate>
        </StyledDialog>
    );
};
