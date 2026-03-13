import useToast from 'hooks/useToast';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router-dom';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { Button } from '@mui/material';
import type { IStrategy, StrategyFormState } from 'interfaces/strategy';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import { useFormErrors } from 'hooks/useFormErrors';
import { formatStrategyName } from 'utils/strategyNames';
import { sortStrategyParameters } from 'utils/sortStrategyParameters';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { CreateFeatureStrategySchema } from 'openapi';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import {
    PROJECT_DEFAULT_STRATEGY_WRITE,
    UPDATE_PROJECT,
} from '@server/types/permissions';
import { useUiFlag } from 'hooks/useUiFlag';
import { LegacyEditDefaultStrategy } from './LegacyEditDefaultStrategy.tsx';
import { StrategyFormBody } from 'component/feature/FeatureStrategy/FeatureStrategyForm/StrategyFormBody.tsx';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { STRATEGY_FORM_SUBMIT_ID } from 'utils/testIds';

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

const NewEditDefaultStrategy = () => {
    const projectId = useRequiredPathParam('projectId');
    const environmentId = useRequiredQueryParam('environmentId');
    const { refetch: refetchProjectOverview } = useProjectOverview(projectId);

    const {
        defaultStrategyFallback,
        strategy: savedStrategy,
        refetch: refetchProject,
    } = useDefaultStrategy(projectId, environmentId);

    const [strategy, setStrategy] = useState<StrategyFormState>(
        (savedStrategy as StrategyFormState) || defaultStrategyFallback,
    );

    const { updateDefaultStrategy, loading } = useProjectApi();
    const { strategyDefinition } = useStrategy(strategy.name);
    const { setToastData, setToastApiError } = useToast();
    const errors = useFormErrors();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();
    const hasValidConstraints = useConstraintsValidation(strategy.constraints);

    if (!strategyDefinition) return null;

    const payload = createStrategyPayload(strategy);

    const onSubmit = async () => {
        const path = `/projects/${projectId}/settings/default-strategy`;
        try {
            await updateDefaultStrategy(projectId, environmentId, payload);

            trackEvent('default_strategy', {
                props: {
                    action: 'edit',
                    hasTitle: Boolean(payload.title),
                },
            });

            refetchProjectOverview();
            setToastData({
                text: 'Default Strategy updated',
                type: 'success',
            });
            await refetchProject();
            navigate(path);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <FormTemplate
            modal
            title={formatStrategyName(strategy.name)}
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
            <StrategyFormBody
                strategy={strategy}
                setStrategy={setStrategy}
                strategyDefinition={strategyDefinition}
                errors={errors}
                onSubmit={onSubmit}
            >
                <PermissionButton
                    permission={[
                        PROJECT_DEFAULT_STRATEGY_WRITE,
                        UPDATE_PROJECT,
                    ]}
                    projectId={projectId}
                    environmentId={environmentId}
                    variant='contained'
                    color='primary'
                    type='submit'
                    disabled={
                        loading ||
                        !hasValidConstraints ||
                        errors.hasFormErrors()
                    }
                    data-testid={STRATEGY_FORM_SUBMIT_ID}
                >
                    Save strategy
                </PermissionButton>
                <Button
                    type='button'
                    onClick={() =>
                        navigate(
                            `/projects/${projectId}/settings/default-strategy`,
                        )
                    }
                >
                    Cancel
                </Button>
            </StrategyFormBody>
        </FormTemplate>
    );
};

const EditDefaultStrategy = () => {
    const useConsolidated = useUiFlag('strategyFormConsolidation');
    return useConsolidated ? (
        <NewEditDefaultStrategy />
    ) : (
        <LegacyEditDefaultStrategy />
    );
};

export const createStrategyPayload = (
    strategy: StrategyFormState,
): CreateFeatureStrategySchema => ({
    name: strategy.name,
    title: strategy.title,
    constraints: strategy.constraints ?? [],
    parameters: (strategy.parameters ?? {}) as Record<string, string>,
    variants: strategy.variants ?? [],
    segments: strategy.segments ?? [],
    disabled: strategy.disabled ?? false,
});

const formatUpdateStrategyApiCode = (
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

    const url = `${unleashUrl}/api/admin/projects/${projectId}/environments/${environmentId}/default-strategy`;
    const payload = JSON.stringify(sortedStrategy, undefined, 2);

    return `curl --location --request POST '${url}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${payload}'`;
};

const projectDefaultStrategyHelp = `
    An activation strategy will only run when a feature flag is enabled and provides a way to control who will get access to the feature.
    If any of a feature flag's activation strategies returns true, the user will get access.
`;

const projectDefaultStrategyDocsLink =
    'https://docs.getunleash.io/concepts/projects#project-default-strategy';

const projectDefaultStrategyDocsLinkLabel = 'Default strategy documentation';

export default EditDefaultStrategy;
