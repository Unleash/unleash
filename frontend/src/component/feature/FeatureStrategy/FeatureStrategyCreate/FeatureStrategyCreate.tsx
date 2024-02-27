import { useEffect, useRef, useState } from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useNavigate } from 'react-router-dom';
import useToast from 'hooks/useToast';
import { IFeatureStrategy, IFeatureStrategyPayload } from 'interfaces/strategy';
import {
    createStrategyPayload,
    featureStrategyDocsLink,
    featureStrategyDocsLinkLabel,
    featureStrategyHelp,
    formatFeaturePath,
} from '../FeatureStrategyEdit/FeatureStrategyEdit';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { ISegment } from 'interfaces/segment';
import { useFormErrors } from 'hooks/useFormErrors';
import { createFeatureStrategy } from 'utils/createFeatureStrategy';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { useCollaborateData } from 'hooks/useCollaborateData';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { comparisonModerator } from '../featureStrategy.utils';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useQueryParams from 'hooks/useQueryParams';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { useDefaultStrategy } from '../../../project/Project/ProjectSettings/ProjectDefaultStrategySettings/ProjectEnvironment/ProjectEnvironmentDefaultStrategy/EditDefaultStrategy';
import { FeatureStrategyForm } from '../FeatureStrategyForm/FeatureStrategyForm';
import { NewStrategyVariants } from 'component/feature/StrategyTypes/NewStrategyVariants';

export const FeatureStrategyCreate = () => {
    const [tab, setTab] = useState(0);
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const environmentId = useRequiredQueryParam('environmentId');
    const strategyName = useRequiredQueryParam('strategyName');
    const { strategy: defaultStrategy, defaultStrategyFallback } =
        useDefaultStrategy(projectId, environmentId);
    const shouldUseDefaultStrategy: boolean = JSON.parse(
        useQueryParams().get('defaultStrategy') || 'false',
    );

    const { segments: allSegments } = useSegments();
    const strategySegments = (allSegments || []).filter((segment) => {
        return defaultStrategy?.segments?.includes(segment.id);
    });

    const [strategy, setStrategy] = useState<Partial<IFeatureStrategy>>({});

    const [segments, setSegments] = useState<ISegment[]>(
        shouldUseDefaultStrategy ? strategySegments : [],
    );
    const { strategyDefinition } = useStrategy(strategyName);
    const errors = useFormErrors();

    const { addStrategyToFeature, loading } = useFeatureStrategyApi();
    const { addChange } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const navigate = useNavigate();

    const { feature, refetchFeature } = useFeature(projectId, featureId);
    const ref = useRef<IFeatureToggle>(feature);
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { trackEvent } = usePlausibleTracker();

    const { data, staleDataNotification, forceRefreshCache } =
        useCollaborateData<IFeatureToggle>(
            {
                unleashGetter: useFeature,
                params: [projectId, featureId],
                dataKey: 'feature',
                refetchFunctionKey: 'refetchFeature',
                options: {},
            },
            feature,
            {
                afterSubmitAction: refetchFeature,
            },
            comparisonModerator,
        );

    useEffect(() => {
        if (ref.current.name === '' && feature.name) {
            forceRefreshCache(feature);
            ref.current = feature;
        }
    }, [feature.name]);

    useEffect(() => {
        if (shouldUseDefaultStrategy) {
            const strategyTemplate = defaultStrategy || defaultStrategyFallback;
            if (strategyTemplate.parameters?.groupId === '' && featureId) {
                setStrategy({
                    ...strategyTemplate,
                    parameters: {
                        ...strategyTemplate.parameters,
                        groupId: featureId,
                    },
                } as any);
            } else {
                setStrategy(strategyTemplate as any);
            }
        } else if (strategyDefinition) {
            setStrategy(createFeatureStrategy(featureId, strategyDefinition));
        }
    }, [
        featureId,
        JSON.stringify(strategyDefinition),
        shouldUseDefaultStrategy,
    ]);

    const onAddStrategy = async (payload: IFeatureStrategyPayload) => {
        await addStrategyToFeature(
            projectId,
            featureId,
            environmentId,
            payload,
        );

        setToastData({
            title: 'Strategy created',
            type: 'success',
            confetti: true,
        });
    };

    const onStrategyRequestAdd = async (payload: IFeatureStrategyPayload) => {
        await addChange(projectId, environmentId, {
            action: 'addStrategy',
            feature: featureId,
            payload,
        });
        // FIXME: segments in change requests
        setToastData({
            title: 'Strategy added to draft',
            type: 'success',
            confetti: true,
        });
        refetchChangeRequests();
    };

    const payload = createStrategyPayload(strategy, segments);

    const onSubmit = async () => {
        trackEvent('strategyTitle', {
            props: {
                hasTitle: Boolean(strategy.title),
                on: 'create',
            },
        });

        try {
            if (isChangeRequestConfigured(environmentId)) {
                await onStrategyRequestAdd(payload);
            } else {
                await onAddStrategy(payload);
            }
            refetchFeature();
            navigate(formatFeaturePath(projectId, featureId));
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const emptyFeature = !data || !data.project;

    if (emptyFeature) return null;

    return (
        <FormTemplate
            modal
            description={featureStrategyHelp}
            documentationLink={featureStrategyDocsLink}
            documentationLinkLabel={featureStrategyDocsLinkLabel}
            disablePadding
            formatApiCode={() =>
                formatAddStrategyApiCode(
                    projectId,
                    featureId,
                    environmentId,
                    payload,
                    unleashUrl,
                )
            }
        >
            <FeatureStrategyForm
                projectId={projectId}
                feature={data}
                strategy={strategy}
                setStrategy={setStrategy}
                segments={segments}
                setSegments={setSegments}
                environmentId={environmentId}
                onSubmit={onSubmit}
                loading={loading}
                permission={CREATE_FEATURE_STRATEGY}
                errors={errors}
                isChangeRequest={isChangeRequestConfigured(environmentId)}
                tab={tab}
                setTab={setTab}
                StrategyVariants={
                    <NewStrategyVariants
                        strategy={strategy}
                        setStrategy={setStrategy}
                        environment={environmentId}
                        projectId={projectId}
                        editable
                    />
                }
            />
            {staleDataNotification}
        </FormTemplate>
    );
};

export const formatCreateStrategyPath = (
    projectId: string,
    featureId: string,
    environmentId: string,
    strategyName: string,
    defaultStrategy: boolean = false,
): string => {
    const params = new URLSearchParams({
        environmentId,
        strategyName,
        defaultStrategy: String(defaultStrategy),
    });

    return `/projects/${projectId}/features/${featureId}/strategies/create?${params}`;
};

export const formatAddStrategyApiCode = (
    projectId: string,
    featureId: string,
    environmentId: string,
    strategy: Partial<IFeatureStrategy>,
    unleashUrl?: string,
): string => {
    if (!unleashUrl) {
        return '';
    }

    const url = `${unleashUrl}/api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies`;
    const payload = JSON.stringify(strategy, undefined, 2);

    return `curl --location --request POST '${url}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${payload}'`;
};
