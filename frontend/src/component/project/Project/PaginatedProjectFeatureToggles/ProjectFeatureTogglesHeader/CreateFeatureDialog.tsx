import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import {
    type ReactNode,
    useState,
    useContext,
    type FormEvent,
    useMemo,
} from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router-dom';
import { Dialog, styled } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { Limit } from 'component/common/Limit/Limit';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import UIContext from 'contexts/UIContext';
import useFeatureForm from 'component/feature/hooks/useFeatureForm';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import FlagIcon from '@mui/icons-material/Flag';
import ImpressionDataIcon from '@mui/icons-material/AltRoute';
import { useFlagLimits } from 'component/feature/CreateFeature/CreateFeature';
import { useGlobalFeatureSearch } from 'component/feature/FeatureToggleList/useGlobalFeatureSearch';
import useProjectOverview, {
    featuresCount,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import type { FeatureTypeSchema } from 'openapi';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { DialogFormTemplate } from 'component/common/DialogFormTemplate/DialogFormTemplate';
import { SingleSelectConfigButton } from 'component/common/DialogFormTemplate/ConfigButtons/SingleSelectConfigButton';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';

interface ICreateFeatureDialogProps {
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

const configButtonData = {
    project: {
        icon: <ProjectIcon />,
        text: 'Projects allow you to group feature flags together in the management UI.',
    },
    type: {
        icon: <FlagIcon />,
        text: "A flag's type conveys its purpose.",
    },

    impressionData: {
        icon: <ImpressionDataIcon />,
        text: 'Impression data is used to track how your flag is performing.',
    },
};

export const CreateFeatureDialog = ({
    open,
    onClose,
}: ICreateFeatureDialogProps) => {
    const { setToastData, setToastApiError } = useToast();
    const { setShowFeedback } = useContext(UIContext);
    const { uiConfig, isOss } = useUiConfig();
    const navigate = useNavigate();

    const {
        type,
        setType,
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
    } = useFeatureForm();
    const { createFeatureToggle, loading } = useFeatureApi();

    const generalDocumentation: {
        icon: ReactNode;
        text: string;
        link?: { url: string; label: string };
    } = {
        icon: <FlagIcon aria-hidden='true' />,
        text: 'Feature flags are the core of Unleash.',
        link: {
            url: 'https://docs.getunleash.io/reference/feature-toggles',
            label: 'Feature flags documentation',
        },
    };

    const [documentation, setDocumentation] = useState(generalDocumentation);

    const clearDocumentationOverride = () =>
        setDocumentation(generalDocumentation);

    const flagPayload = getTogglePayload();

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/projects/${project}/features' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(flagPayload, undefined, 2)}'`;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearErrors();
        const validToggleName = await validateToggleName();

        if (validToggleName) {
            const payload = getTogglePayload();
            try {
                await createFeatureToggle(project, payload);
                navigate(`/projects/${project}/features/${name}`);
                setToastData({
                    title: 'Flag created successfully',
                    text: 'Now you can start using your flag.',
                    confetti: true,
                    type: 'success',
                });
                setShowFeedback(true);
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const { total: totalFlags, loading: loadingTotalFlagCount } =
        useGlobalFeatureSearch();

    const { project: projectInfo } = useProjectOverview(project);

    const resourceLimitsEnabled = useUiFlag('resourceLimits');

    const { globalFlagLimitReached, projectFlagLimitReached, limitMessage } =
        useFlagLimits({
            global: {
                limit: uiConfig.resourceLimits.featureFlags,
                count: totalFlags ?? 0,
            },
            project: {
                limit: projectInfo.featureLimit,
                count: featuresCount(projectInfo),
            },
        });

    const { projects } = useProjects();
    const { featureTypes } = useFeatureTypes();
    const FeatureTypeIcon = getFeatureTypeIcons(type);

    const longestFeatureTypeName = featureTypes.reduce(
        (prev: number, type: { name: string }) =>
            prev >= type.name.length ? prev : type.name.length,
        0,
    );

    const currentProjectName = useMemo(() => {
        const projectObject = projects.find((p) => p.id === project);
        return projectObject?.name;
    }, [project, projects]);

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
                    createButtonProps={{
                        disabled:
                            loading ||
                            loadingTotalFlagCount ||
                            globalFlagLimitReached ||
                            projectFlagLimitReached,
                        permission: CREATE_FEATURE,
                        tooltipProps: { title: limitMessage, arrow: true },
                    }}
                    description={description}
                    errors={errors}
                    handleSubmit={handleSubmit}
                    Icon={<FlagIcon />}
                    validateName={validateToggleName}
                    Limit={
                        <ConditionallyRender
                            condition={resourceLimitsEnabled}
                            show={
                                <Limit
                                    name='feature flags'
                                    limit={uiConfig.resourceLimits.featureFlags}
                                    currentValue={totalFlags ?? 0}
                                />
                            }
                        />
                    }
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
                                        options={projects.map((project) => ({
                                            label: project.name,
                                            value: project.id,
                                        }))}
                                        onChange={(value: any) => {
                                            setProject(value);
                                        }}
                                        button={{
                                            label:
                                                currentProjectName ?? project,
                                            icon: configButtonData.project.icon,
                                            labelWidth: '12ch',
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
                            <SingleSelectConfigButton
                                tooltip={{
                                    header: 'Select a flag type',
                                }}
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
                                        featureTypes.find((t) => t.id === type)
                                            ?.name || 'Select flag type',
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

                            <SingleSelectConfigButton
                                tooltip={{
                                    header: 'Enable or disable impression data',
                                }}
                                description={
                                    configButtonData.impressionData.text
                                }
                                options={[
                                    { label: 'On', value: 'true' },
                                    { label: 'Off', value: 'false' },
                                ]}
                                onChange={(value: string) => {
                                    setImpressionData(value === 'true');
                                }}
                                button={{
                                    label: `Impression data ${impressionData ? 'on' : 'off'}`,
                                    icon: <ImpressionDataIcon />,
                                    labelWidth: `${'impression data off'.length}ch`,
                                }}
                                search={{
                                    label: 'Filter impression data states',
                                    placeholder: 'Select impression data state',
                                }}
                                onOpen={() =>
                                    setDocumentation(
                                        configButtonData.impressionData,
                                    )
                                }
                                onClose={clearDocumentationOverride}
                            />
                        </>
                    }
                />
            </FormTemplate>
        </StyledDialog>
    );
};
