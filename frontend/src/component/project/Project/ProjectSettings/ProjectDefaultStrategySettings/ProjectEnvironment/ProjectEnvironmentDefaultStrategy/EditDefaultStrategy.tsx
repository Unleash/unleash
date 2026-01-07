import useToast from 'hooks/useToast';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router-dom';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { PROJECT_DEFAULT_STRATEGY_WRITE } from 'component/providers/AccessProvider/permissions';
import type { IStrategy } from 'interfaces/strategy';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import type { ISegment } from 'interfaces/segment';
import { useFormErrors } from 'hooks/useFormErrors';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { formatStrategyName } from 'utils/strategyNames';
import { sortStrategyParameters } from 'utils/sortStrategyParameters';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { ProjectDefaultStrategyForm } from './ProjectDefaultStrategyForm.tsx';
import type { CreateFeatureStrategySchema } from 'openapi';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { UPDATE_PROJECT } from '@server/types/permissions';

export const useDefaultStrategy = (
    projectId: string,
    environmentId: string,
) => {
    const { project, refetch } = useProjectOverview(projectId);

    const defaultStrategyFallback = {
        name: 'flexibleRollout',
        constraints: [],
        parameters: {
            rollout: '100',
            stickiness: project.defaultStickiness || 'default',
            groupId: '',
        },
    };

    const strategy = project.environments?.find(
        (env) => env.environment === environmentId,
    )?.defaultStrategy;

    return { defaultStrategyFallback, strategy, refetch };
};

const EditDefaultStrategy = () => {
    const projectId = useRequiredPathParam('projectId');
    const environmentId = useRequiredQueryParam('environmentId');
    const { refetch: refetchProjectOverview } = useProjectOverview(projectId);

    const {
        defaultStrategyFallback,
        strategy,
        refetch: refetchProject,
    } = useDefaultStrategy(projectId, environmentId);

    const [defaultStrategy, setDefaultStrategy] = useState<
        CreateFeatureStrategySchema | undefined
    >(strategy || defaultStrategyFallback);

    const [segments, setSegments] = useState<ISegment[]>([]);
    const { updateDefaultStrategy, loading } = useProjectApi();
    const { strategyDefinition } = useStrategy(defaultStrategy?.name);
    const { setToastData, setToastApiError } = useToast();
    const errors = useFormErrors();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const navigate = useNavigate();

    const { trackEvent } = usePlausibleTracker();

    const {
        segments: allSegments,
        refetchSegments: refetchSavedStrategySegments,
    } = useSegments();

    useEffect(() => {
        // Fill in the selected segments once they've been fetched.
        if (allSegments && strategy?.segments) {
            const temp: ISegment[] = [];
            for (const segmentId of strategy?.segments) {
                temp.push(
                    ...allSegments.filter(
                        (segment) => segment.id === segmentId,
                    ),
                );
            }
            setSegments(temp);
        }
    }, [JSON.stringify(allSegments), JSON.stringify(strategy?.segments)]);

    const payload = createStrategyPayload(defaultStrategy as any, segments);

    const onDefaultStrategyEdit = async (
        payload: CreateFeatureStrategySchema,
    ) => {
        await updateDefaultStrategy(projectId, environmentId, payload);

        trackEvent('default_strategy', {
            props: {
                action: 'edit',
                hasTitle: Boolean(payload.title),
            },
        });

        refetchSavedStrategySegments();
        refetchProjectOverview();
        setToastData({
            text: 'Default Strategy updated',
            type: 'success',
        });
    };

    const onSubmit = async () => {
        const path = `/projects/${projectId}/settings/default-strategy`;
        try {
            await onDefaultStrategyEdit(payload);
            await refetchProject();
            navigate(path);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    if (!strategyDefinition) {
        return null;
    }

    if (!defaultStrategy) return null;
    return (
        <FormTemplate
            modal
            title={formatStrategyName(defaultStrategy?.name ?? '')}
            description={projectDefaultStrategyHelp}
            documentationLink={projectDefaultStrategyDocsLink}
            documentationLinkLabel={projectDefaultStrategyDocsLinkLabel}
            formatApiCode={() =>
                formatUpdateStrategyApiCode(
                    projectId,
                    environmentId,
                    payload,
                    strategyDefinition,
                    unleashUrl,
                )
            }
        >
            <ProjectDefaultStrategyForm
                projectId={projectId}
                strategy={defaultStrategy as any}
                setStrategy={setDefaultStrategy as any}
                segments={segments}
                setSegments={setSegments}
                environmentId={environmentId}
                onSubmit={onSubmit}
                loading={loading}
                permission={[PROJECT_DEFAULT_STRATEGY_WRITE, UPDATE_PROJECT]}
                errors={errors}
                isChangeRequest={false}
            />
        </FormTemplate>
    );
};

export const createStrategyPayload = (
    strategy: CreateFeatureStrategySchema,
    segments: ISegment[],
): CreateFeatureStrategySchema => ({
    name: strategy.name,
    title: strategy.title,
    constraints: strategy.constraints ?? [],
    parameters: strategy.parameters ?? {},
    variants: strategy.variants ?? [],
    segments: segments.map((segment) => segment.id),
    disabled: strategy.disabled ?? false,
});

export const formatUpdateStrategyApiCode = (
    projectId: string,
    environmentId: string,
    strategy: CreateFeatureStrategySchema,
    strategyDefinition: IStrategy,
    unleashUrl?: string,
): string => {
    if (!unleashUrl) {
        return '';
    }

    // Sort the strategy parameters payload so that they match
    // the order of the input fields in the form, for usability.
    const sortedStrategy = {
        ...strategy,
        parameters: sortStrategyParameters(
            strategy.parameters ?? {},
            strategyDefinition,
        ),
    };

    const url = `${unleashUrl}/api/admin/projects/${projectId}/environments/${environmentId}/default-strategy}`;
    const payload = JSON.stringify(sortedStrategy, undefined, 2);

    return `curl --location --request PUT '${url}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${payload}'`;
};

export const projectDefaultStrategyHelp = `
    An activation strategy will only run when a feature flag is enabled and provides a way to control who will get access to the feature.
    If any of a feature flag's activation strategies returns true, the user will get access.
`;

export const projectDefaultStrategyDocsLink =
    'https://docs.getunleash.io/concepts/projects#project-default-strategy';

export const projectDefaultStrategyDocsLinkLabel =
    'Default strategy documentation';

export default EditDefaultStrategy;
