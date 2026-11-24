import useToast from 'hooks/useToast';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import { Button } from '@mui/material';
import type { IStrategy, StrategyFormState } from 'interfaces/strategy';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import { useFormErrors } from 'hooks/useFormErrors';
import { sortStrategyParameters } from 'utils/sortStrategyParameters';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { useEventTracker } from 'hooks/useEventTracker';
import type { CreateFeatureStrategySchema } from 'openapi';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import {
    PROJECT_DEFAULT_STRATEGY_WRITE,
    UPDATE_PROJECT,
} from '@server/types/permissions';
import { StrategyFormBodySelector } from 'component/feature/FeatureStrategy/FeatureStrategyForm/StrategyFormBodySelector.tsx';
import { createStrategyPayload } from 'component/feature/FeatureStrategy/featureStrategy.utils';
import { withIncompleteConstraintsDiscarded } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import { useUiFlag } from 'hooks/useUiFlag';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { STRATEGY_FORM_SUBMIT_ID } from 'utils/testIds';
import { StrategyFormTemplate } from 'component/feature/FeatureStrategy/FeatureStrategyForm/StrategyFormTemplate';
import { FormFocusProvider } from 'component/feature/FeatureStrategy/FeatureStrategyForm/formFocus.tsx';
import { useStrategyFormValidation } from 'component/feature/FeatureStrategy/FeatureStrategyForm/useStrategyFormValidation.ts';
import { IncompleteConstraintsNote } from 'component/feature/FeatureStrategy/FeatureStrategyForm/IncompleteConstraintsNote.tsx';

export const useDefaultStrategy = (
    projectId: string,
    environmentId: string,
) => {
    const { project, loading, refetch } = useProjectOverview(projectId);

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
    )?.defaultStrategy as StrategyFormState;

    return { defaultStrategyFallback, strategy, loading, refetch };
};

const EditDefaultStrategy = () => {
    const projectId = useRequiredPathParam('projectId');
    const environmentId = useRequiredQueryParam('environmentId');
    const { refetch: refetchProjectOverview } = useProjectOverview(projectId);

    const {
        defaultStrategyFallback,
        strategy: savedStrategy,
        loading: loadingSavedStrategy,
        refetch: refetchProject,
    } = useDefaultStrategy(projectId, environmentId);

    const [strategy, setStrategy] = useState<StrategyFormState>(
        (savedStrategy as StrategyFormState) || defaultStrategyFallback,
    );

    useEffect(() => {
        if (savedStrategy) {
            setStrategy(savedStrategy);
        }
    }, [savedStrategy]);

    const { updateDefaultStrategy, loading } = useProjectApi();
    const { strategyDefinition } = useStrategy(strategy.name);
    const { setToastData, setToastApiError } = useToast();
    const errors = useFormErrors();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const navigate = useNavigate();
    const { trackEvent } = useEventTracker();
    const singlePageStrategyForm = useUiFlag('singlePageStrategyForm');
    const {
        focusRegistry,
        failedVariantsSubmit,
        clearFailedVariantsSubmit,
        validateParameter,
        formIsValid,
        validatingConstraints,
        legacyFormHasBlockingErrors,
    } = useStrategyFormValidation({
        strategy,
        strategyDefinition,
        errors,
        strategyFormType: 'projectDefaultStrategy',
    });

    if (!strategyDefinition) return null;

    const payload = createStrategyPayload(
        singlePageStrategyForm
            ? withIncompleteConstraintsDiscarded(strategy)
            : strategy,
    );

    const onSubmit = async () => {
        if (singlePageStrategyForm && !(await formIsValid())) return;

        const path = `/projects/${projectId}/settings/default-strategy`;
        try {
            await updateDefaultStrategy(projectId, environmentId, payload);

            trackEvent('default-strategy', {
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
        <StrategyFormTemplate
            formContext='projectDefaultStrategy'
            loading={loadingSavedStrategy}
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
            <FormFocusProvider registry={focusRegistry}>
                <StrategyFormBodySelector
                    strategy={strategy}
                    setStrategy={setStrategy}
                    strategyDefinition={strategyDefinition}
                    errors={errors}
                    failedVariantsSubmit={failedVariantsSubmit}
                    clearFailedVariantsSubmit={clearFailedVariantsSubmit}
                    validateParameter={
                        singlePageStrategyForm ? validateParameter : undefined
                    }
                    groupIdTooltip='Defaults to the feature flag name if not set.'
                    onSubmit={onSubmit}
                >
                    <IncompleteConstraintsNote
                        constraints={strategy.constraints}
                    />
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
                            validatingConstraints ||
                            legacyFormHasBlockingErrors
                        }
                        data-testid={STRATEGY_FORM_SUBMIT_ID}
                    >
                        Save strategy
                    </PermissionButton>
                </StrategyFormBodySelector>
            </FormFocusProvider>
        </StrategyFormTemplate>
    );
};

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

export default EditDefaultStrategy;
