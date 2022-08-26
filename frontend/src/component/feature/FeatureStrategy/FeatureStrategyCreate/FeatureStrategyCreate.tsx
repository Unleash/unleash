import React, { useEffect, useState } from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import { FeatureStrategyForm } from 'component/feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyForm';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useNavigate } from 'react-router-dom';
import useToast from 'hooks/useToast';
import { IFeatureStrategy } from 'interfaces/strategy';
import {
    featureStrategyDocsLink,
    featureStrategyHelp,
    formatFeaturePath,
    createStrategyPayload,
    featureStrategyDocsLinkLabel,
} from '../FeatureStrategyEdit/FeatureStrategyEdit';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { ISegment } from 'interfaces/segment';
import { useSegmentsApi } from 'hooks/api/actions/useSegmentsApi/useSegmentsApi';
import { formatStrategyName } from 'utils/strategyNames';
import { useFeatureImmutable } from 'hooks/api/getters/useFeature/useFeatureImmutable';
import { useFormErrors } from 'hooks/useFormErrors';
import { createFeatureStrategy } from 'utils/createFeatureStrategy';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';

export const FeatureStrategyCreate = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const environmentId = useRequiredQueryParam('environmentId');
    const strategyName = useRequiredQueryParam('strategyName');
    const [strategy, setStrategy] = useState<Partial<IFeatureStrategy>>({});
    const [segments, setSegments] = useState<ISegment[]>([]);
    const { strategyDefinition } = useStrategy(strategyName);
    const errors = useFormErrors();

    const { addStrategyToFeature, loading } = useFeatureStrategyApi();
    const { setStrategySegments } = useSegmentsApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const navigate = useNavigate();

    const { feature, refetchFeature } = useFeatureImmutable(
        projectId,
        featureId
    );

    useEffect(() => {
        if (strategyDefinition) {
            setStrategy(createFeatureStrategy(featureId, strategyDefinition));
        }
    }, [featureId, strategyDefinition]);

    const onSubmit = async () => {
        try {
            const created = await addStrategyToFeature(
                projectId,
                featureId,
                environmentId,
                createStrategyPayload(strategy)
            );
            if (uiConfig.flags.SE) {
                await setStrategySegments({
                    environmentId,
                    projectId,
                    strategyId: created.id,
                    segmentIds: segments.map(s => s.id),
                });
            }
            setToastData({
                title: 'Strategy created',
                type: 'success',
                confetti: true,
            });
            refetchFeature();
            navigate(formatFeaturePath(projectId, featureId));
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

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
                permission={CREATE_FEATURE_STRATEGY}
                errors={errors}
            />
        </FormTemplate>
    );
};

export const formatCreateStrategyPath = (
    projectId: string,
    featureId: string,
    environmentId: string,
    strategyName: string
): string => {
    const params = new URLSearchParams({ environmentId, strategyName });

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
