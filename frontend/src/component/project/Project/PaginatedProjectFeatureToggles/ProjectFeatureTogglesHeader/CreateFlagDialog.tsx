import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { type ReactNode, useState, useContext, type FormEvent } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router-dom';
import { Dialog, styled } from '@mui/material';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIconSmall.svg';
import { useUiFlag } from 'hooks/useUiFlag';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { Limit } from 'component/common/Limit/Limit';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import UIContext from 'contexts/UIContext';
import useFeatureForm from 'component/feature/hooks/useFeatureForm';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { DialogFormTemplate } from '../../CreateProject/NewCreateProjectForm/DialogFormTemplate';
import FlagIcon from '@mui/icons-material/Flag';
import { useFlagLimits } from 'component/feature/CreateFeature/CreateFeature';
import { useGlobalFeatureSearch } from 'component/feature/FeatureToggleList/useGlobalFeatureSearch';
import useProjectOverview, {
    featuresCount,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';

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

const CREATE_PROJECT_BTN = 'CREATE_PROJECT_BTN';

const StyledProjectIcon = styled(ProjectIcon)(({ theme }) => ({
    fill: theme.palette.common.white,
    stroke: theme.palette.common.white,
}));

const useProjectLimit = () => {
    const resourceLimitsEnabled = useUiFlag('resourceLimits');
    const { projects, loading: loadingProjects } = useProjects();
    const { uiConfig, loading: loadingConfig } = useUiConfig();
    const projectsLimit = uiConfig.resourceLimits?.projects;
    const limitReached =
        resourceLimitsEnabled && projects.length >= projectsLimit;

    return {
        resourceLimitsEnabled,
        limit: projectsLimit,
        currentValue: projects.length,
        limitReached,
        loading: loadingConfig || loadingProjects,
    };
};

export const CreateFlagDialog = ({
    open,
    onClose,
}: ICreateProjectDialogProps) => {
    const { setToastData, setToastApiError } = useToast();
    const { setShowFeedback } = useContext(UIContext);
    const { uiConfig } = useUiConfig();
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
        icon: <StyledProjectIcon />,
        text: 'Projects allows you to group feature flags together in the management UI.',
        link: {
            url: 'https://docs.getunleash.io/reference/projects',
            label: 'Projects documentation',
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
                navigate(`/projects/${project}/features/${name}`, {
                    replace: true,
                });
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
                    optionButtons={[]}
                    resource={'feature flag'}
                    setDescription={setDescription}
                    setName={setName}
                />
            </FormTemplate>
        </StyledDialog>
    );
};
