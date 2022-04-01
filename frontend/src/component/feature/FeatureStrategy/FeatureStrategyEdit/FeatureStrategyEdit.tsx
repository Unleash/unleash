import React, { useEffect, useState } from 'react';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { FeatureStrategyForm } from 'component/feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyForm';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useHistory } from 'react-router-dom';
import useToast from 'hooks/useToast';
import { IFeatureStrategy, IStrategyPayload } from 'interfaces/strategy';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { ISegment } from 'interfaces/segment';
import { useSegmentsApi } from 'hooks/api/actions/useSegmentsApi/useSegmentsApi';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { formatStrategyName } from 'utils/strategyNames';

export const FeatureStrategyEdit = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const environmentId = useRequiredQueryParam('environmentId');
    const strategyId = useRequiredQueryParam('strategyId');

    const [strategy, setStrategy] = useState<Partial<IFeatureStrategy>>({});
    const [segments, setSegments] = useState<ISegment[]>([]);
    const { updateStrategyOnFeature, loading } = useFeatureStrategyApi();
    const { feature, refetchFeature } = useFeature(projectId, featureId);
    const { setStrategySegments } = useSegmentsApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const { push } = useHistory();

    const {
        segments: savedStrategySegments,
        refetchSegments: refetchSavedStrategySegments,
    } = useSegments(strategyId);

    useEffect(() => {
        const savedStrategy = feature.environments
            .flatMap(environment => environment.strategies)
            .find(strategy => strategy.id === strategyId);
        setStrategy(prev => ({ ...prev, ...savedStrategy }));
    }, [strategyId, feature]);

    useEffect(() => {
        // Fill in the selected segments once they've been fetched.
        savedStrategySegments && setSegments(savedStrategySegments);
    }, [savedStrategySegments]);

    const onSubmit = async () => {
        try {
            await updateStrategyOnFeature(
                projectId,
                featureId,
                environmentId,
                strategyId,
                createStrategyPayload(strategy)
            );
            if (uiConfig.flags.SE) {
                await setStrategySegments({
                    environmentId,
                    projectId,
                    strategyId,
                    segmentIds: segments.map(s => s.id),
                });
                await refetchSavedStrategySegments();
            }
            setToastData({
                title: 'Strategy updated',
                type: 'success',
                confetti: true,
            });
            refetchFeature();
            push(formatFeaturePath(projectId, featureId));
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    // Wait until the strategy has loaded before showing the form.
    if (!strategy.id) {
        return null;
    }

    return (
        <FormTemplate
            modal
            title={formatStrategyName(strategy.name ?? '')}
            description={featureStrategyHelp}
            documentationLink={featureStrategyDocsLink}
            formatApiCode={() =>
                formatUpdateStrategyApiCode(
                    projectId,
                    featureId,
                    environmentId,
                    strategy,
                    unleashUrl
                )
            }
        >
            <FeatureStrategyForm
                feature={feature}
                strategy={strategy}
                setStrategy={setStrategy}
                segments={segments}
                setSegments={setSegments}
                environmentId={environmentId}
                onSubmit={onSubmit}
                loading={loading}
                permission={UPDATE_FEATURE_STRATEGY}
            />
        </FormTemplate>
    );
};

export const createStrategyPayload = (
    strategy: Partial<IFeatureStrategy>
): IStrategyPayload => {
    return {
        name: strategy.name,
        constraints: strategy.constraints ?? [],
        parameters: strategy.parameters ?? {},
    };
};

export const formatFeaturePath = (
    projectId: string,
    featureId: string
): string => {
    return `/projects/${projectId}/features/${featureId}`;
};

export const formatEditStrategyPath = (
    projectId: string,
    featureId: string,
    environmentId: string,
    strategyId: string
): string => {
    const params = new URLSearchParams({ environmentId, strategyId });

    return `/projects/${projectId}/features/${featureId}/strategies/edit?${params}`;
};

const formatUpdateStrategyApiCode = (
    projectId: string,
    featureId: string,
    environmentId: string,
    strategy: Partial<IFeatureStrategy>,
    unleashUrl?: string
): string => {
    if (!unleashUrl) {
        return '';
    }

    const url = `${unleashUrl}/api/admin/projects/${projectId}/features/${featureId}/${environmentId}/development/strategies/${strategy.id}`;
    const payload = JSON.stringify(strategy, undefined, 2);

    return `curl --location --request PUT '${url}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${payload}'`;
};

export const featureStrategyHelp = `
    An activation strategy will only run when a feature toggle is enabled and provides a way to control who will get access to the feature.
    If any of a feature toggle's activation strategies returns true, the user will get access.
`;

export const featureStrategyDocsLink =
    'https://docs.getunleash.io/user_guide/activation_strategy';
