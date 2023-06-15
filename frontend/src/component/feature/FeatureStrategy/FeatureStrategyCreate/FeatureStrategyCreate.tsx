import React, { useEffect, useRef, useState } from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import { FeatureStrategyForm } from 'component/feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyForm';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useNavigate } from 'react-router-dom';
import useToast from 'hooks/useToast';
import { IFeatureStrategy, IFeatureStrategyPayload } from 'interfaces/strategy';
import {
    featureStrategyDocsLink,
    featureStrategyHelp,
    formatFeaturePath,
    createStrategyPayload,
    featureStrategyDocsLinkLabel,
} from '../FeatureStrategyEdit/FeatureStrategyEdit';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { ISegment } from 'interfaces/segment';
import { formatStrategyName } from 'utils/strategyNames';
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
import useProject from 'hooks/api/getters/useProject/useProject';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';

export const FeatureStrategyCreate = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const environmentId = useRequiredQueryParam('environmentId');
    const strategyName = useRequiredQueryParam('strategyName');
    const useDefaultStrategy: boolean = JSON.parse(
        useQueryParams().get('defaultStrategy') || 'false'
    );
    const { project } = useProject(projectId);

    const defaultStrategy = project.environments.find(
        env => env.environment === environmentId
    )?.defaultStrategy;

    const { segments: allSegments } = useSegments();
    const strategySegments =
        allSegments?.filter(segment => {
            return defaultStrategy?.segments?.includes(segment.id);
        }) || [];

    const [strategy, setStrategy] = useState<Partial<IFeatureStrategy>>({});

    const [segments, setSegments] = useState<ISegment[]>(strategySegments);
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
            comparisonModerator
        );

    useEffect(() => {
        if (ref.current.name === '' && feature.name) {
            forceRefreshCache(feature);
            ref.current = feature;
        }
    }, [feature.name]);

    useEffect(() => {
        if (useDefaultStrategy) {
            setStrategy((defaultStrategy as any) || {});
        } else if (strategyDefinition) {
            setStrategy(createFeatureStrategy(featureId, strategyDefinition));
        }
    }, [featureId, strategyDefinition, useDefaultStrategy]);

    const onAddStrategy = async (payload: IFeatureStrategyPayload) => {
        await addStrategyToFeature(
            projectId,
            featureId,
            environmentId,
            payload
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
            title={formatStrategyName(strategyName)}
            description={featureStrategyHelp}
            documentationLink={featureStrategyDocsLink}
            documentationLinkLabel={featureStrategyDocsLinkLabel}
            formatApiCode={() =>
                formatAddStrategyApiCode(
                    projectId,
                    featureId,
                    environmentId,
                    payload,
                    unleashUrl
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
    defaultStrategy: boolean = false
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
    unleashUrl?: string
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
