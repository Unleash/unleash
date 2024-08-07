import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useNavigate } from 'react-router-dom';
import FeatureForm from '../FeatureForm/FeatureForm';
import useFeatureForm from '../hooks/useFeatureForm';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { useContext } from 'react';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import UIContext from 'contexts/UIContext';
import { CF_CREATE_BTN_ID } from 'utils/testIds';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GO_BACK } from 'constants/navigate';
import { Alert, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useProjectOverview, {
    featuresCount,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useUiFlag } from 'hooks/useUiFlag';
import { useGlobalFeatureSearch } from '../FeatureToggleList/useGlobalFeatureSearch';
import { Limit } from 'component/common/Limit/Limit';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

export const isProjectFeatureLimitReached = (
    featureLimit: number | null | undefined,
    currentFeatureCount: number,
): boolean => {
    return (
        featureLimit !== null &&
        featureLimit !== undefined &&
        featureLimit <= currentFeatureCount
    );
};

const useGlobalFlagLimit = (flagLimit: number, flagCount: number) => {
    const resourceLimitsEnabled = useUiFlag('resourceLimits');
    const limitReached = resourceLimitsEnabled && flagCount >= flagLimit;

    return {
        limitReached,
        limitMessage: limitReached
            ? `You have reached the instance-wide limit of ${flagLimit} feature flags.`
            : undefined,
    };
};

type FlagLimitsProps = {
    global: { limit: number; count: number };
    project: { limit?: number; count: number };
};

export const useFlagLimits = ({ global, project }: FlagLimitsProps) => {
    const {
        limitReached: globalFlagLimitReached,
        limitMessage: globalLimitMessage,
    } = useGlobalFlagLimit(global.limit, global.count);

    const projectFlagLimitReached = isProjectFeatureLimitReached(
        project.limit,
        project.count,
    );

    const limitMessage = globalFlagLimitReached
        ? globalLimitMessage
        : projectFlagLimitReached
          ? `You have reached the project limit of ${project.limit} feature flags.`
          : undefined;

    return {
        limitMessage,
        globalFlagLimitReached,
        projectFlagLimitReached,
    };
};

const CreateFeature = () => {
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

    const { project: projectInfo } = useProjectOverview(project);

    const { createFeatureToggle, loading } = useFeatureApi();

    const { total: totalFlags, loading: loadingTotalFlagCount } =
        useGlobalFeatureSearch();

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

    const handleSubmit = async (e: Event) => {
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

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/projects/${project}/features' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(getTogglePayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title='Create feature flag'
            description='Feature flags support different use cases, each with their own specific needs such as simple static routing or more complex routing.
            The feature flag is disabled when created and you decide when to enable'
            documentationLink='https://docs.getunleash.io/reference/feature-toggle-types'
            documentationLinkLabel='Feature flag types documentation'
            formatApiCode={formatApiCode}
        >
            <ConditionallyRender
                condition={projectFlagLimitReached}
                show={
                    <StyledAlert severity='error'>
                        <strong>Feature flag project limit reached. </strong> To
                        be able to create more feature flags in this project
                        please increase the feature flag upper limit in the
                        project settings.
                    </StyledAlert>
                }
            />

            <FeatureForm
                type={type}
                name={name}
                project={project}
                description={description}
                setType={setType}
                setName={setName}
                setProject={setProject}
                setDescription={setDescription}
                validateToggleName={validateToggleName}
                setImpressionData={setImpressionData}
                impressionData={impressionData}
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                mode='Create'
                clearErrors={clearErrors}
                featureNaming={projectInfo.featureNaming}
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
            >
                <CreateButton
                    name='feature flag'
                    disabled={
                        loadingTotalFlagCount ||
                        globalFlagLimitReached ||
                        projectFlagLimitReached
                    }
                    permission={CREATE_FEATURE}
                    projectId={project}
                    data-testid={CF_CREATE_BTN_ID}
                    tooltipProps={{
                        title: limitMessage,
                        arrow: true,
                    }}
                />
            </FeatureForm>
        </FormTemplate>
    );
};

export default CreateFeature;
