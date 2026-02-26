import { useEffect, useRef, useState } from 'react';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useNavigate } from 'react-router-dom';
import useToast from 'hooks/useToast';
import type {
    IFeatureStrategy,
    IFeatureStrategyPayload,
    IStrategy,
} from 'interfaces/strategy';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import type { ISegment } from 'interfaces/segment';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { useFormErrors } from 'hooks/useFormErrors';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { sortStrategyParameters } from 'utils/sortStrategyParameters';
import { useCollaborateData } from 'hooks/useCollaborateData';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { comparisonModerator } from '../featureStrategy.utils';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { FeatureStrategyForm } from '../FeatureStrategyForm/FeatureStrategyForm.tsx';
import { LegacyFeatureStrategyForm } from '../FeatureStrategyForm/LegacyFeatureStrategyForm.tsx';
import { NewStrategyVariants } from 'component/feature/StrategyTypes/NewStrategyVariants';
import { useScheduledChangeRequestsWithStrategy } from 'hooks/api/getters/useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy';
import {
    getChangeRequestConflictCreatedData,
    getChangeRequestConflictCreatedDataFromScheduleData,
} from './change-request-conflict-data.ts';
import { constraintId } from 'constants/constraintId.ts';
import { apiPayloadConstraintReplacer } from 'utils/api-payload-constraint-replacer.ts';
import { useDefaultProjectSettings } from 'hooks/useDefaultProjectSettings';
import { createFeatureStrategy } from 'utils/createFeatureStrategy.ts';
import { useUiFlag } from 'hooks/useUiFlag.ts';

const useTitleTracking = () => {
    const [previousTitle, setPreviousTitle] = useState<string>('');
    const { trackEvent } = usePlausibleTracker();

    const trackTitle = (title: string = '') => {
        // don't expose the title, just if it was added, removed, or edited
        if (title === previousTitle) {
            trackEvent('strategyTitle', {
                props: {
                    action: 'none',
                    on: 'edit',
                },
            });
        }
        if (previousTitle === '' && title !== '') {
            trackEvent('strategyTitle', {
                props: {
                    action: 'added',
                    on: 'edit',
                },
            });
        }
        if (previousTitle !== '' && title === '') {
            trackEvent('strategyTitle', {
                props: {
                    action: 'removed',
                    on: 'edit',
                },
            });
        }
        if (previousTitle !== '' && title !== '' && title !== previousTitle) {
            trackEvent('strategyTitle', {
                props: {
                    action: 'edited',
                    on: 'edit',
                },
            });
        }
    };

    return {
        setPreviousTitle,
        trackTitle,
    };
};

const addIdSymbolToConstraints = (strategy?: IFeatureStrategy) => {
    if (!strategy) return;

    return strategy?.constraints.map((constraint) => {
        return { ...constraint, [constraintId]: crypto.randomUUID() };
    });
};

const LegacyFeatureStrategyEdit = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const environmentId = useRequiredQueryParam('environmentId');
    const strategyId = useRequiredQueryParam('strategyId');
    const [tab, setTab] = useState(0);

    const [strategy, setStrategy] = useState<Partial<IFeatureStrategy>>({});
    const [segments, setSegments] = useState<ISegment[]>([]);
    const { updateStrategyOnFeature, loading } = useFeatureStrategyApi();
    const { strategyDefinition } = useStrategy(strategy.name);
    const { defaultStickiness } = useDefaultProjectSettings(projectId);
    const { setToastData, setToastApiError } = useToast();
    const errors = useFormErrors();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const navigate = useNavigate();
    const { addChange } = useChangeRequestApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { refetch: refetchChangeRequests, data: pendingChangeRequests } =
        usePendingChangeRequests(projectId);
    const { setPreviousTitle } = useTitleTracking();

    const { feature, refetchFeature } = useFeature(projectId, featureId);

    const ref = useRef<IFeatureToggle>(feature);

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
    }, [feature]);

    const { trackEvent } = usePlausibleTracker();
    const { changeRequests: scheduledChangeRequestThatUseStrategy } =
        useScheduledChangeRequestsWithStrategy(projectId, strategyId);

    const pendingCrsUsingThisStrategy = getChangeRequestConflictCreatedData(
        pendingChangeRequests,
        featureId,
        strategyId,
        uiConfig,
    );

    const scheduledCrsUsingThisStrategy =
        getChangeRequestConflictCreatedDataFromScheduleData(
            scheduledChangeRequestThatUseStrategy,
            uiConfig,
        );

    const emitConflictsCreatedEvents = (): void =>
        [
            ...pendingCrsUsingThisStrategy,
            ...scheduledCrsUsingThisStrategy,
        ].forEach((data) => {
            trackEvent('change_request', {
                props: {
                    ...data,
                    action: 'edit-strategy',
                    eventType: 'conflict-created',
                },
            });
        });

    const {
        segments: savedStrategySegments,
        refetchSegments: refetchSavedStrategySegments,
    } = useSegments(strategyId);

    useEffect(() => {
        const savedStrategy = data?.environments
            .flatMap((environment) => environment.strategies)
            .find((strategy) => strategy.id === strategyId);

        const constraintsWithId = addIdSymbolToConstraints(savedStrategy);

        const formattedStrategy = {
            ...savedStrategy,
            constraints: constraintsWithId,
        };

        setStrategy((prev) => ({ ...prev, ...formattedStrategy }));
        setPreviousTitle(savedStrategy?.title || '');
    }, [strategyId, data]);

    useEffect(() => {
        // Fill in the selected segments once they've been fetched.
        savedStrategySegments && setSegments(savedStrategySegments);
    }, [JSON.stringify(savedStrategySegments)]);

    const handleMissingParameters = useUiFlag('strategyFormConsolidation');
    useEffect(() => {
        if (!strategyDefinition || !handleMissingParameters) {
            return;
        }

        const defaultParameters = createFeatureStrategy(
            featureId,
            strategyDefinition,
            defaultStickiness,
        ).parameters;

        setStrategy((prev) => {
            return {
                ...prev,
                parameters: {
                    ...defaultParameters,
                    ...prev.parameters,
                },
            };
        });
    }, [handleMissingParameters, defaultStickiness, strategyDefinition?.name]);

    const payload = legacyCreateStrategyPayload(strategy, segments);

    const onStrategyEdit = async (payload: IFeatureStrategyPayload) => {
        await updateStrategyOnFeature(
            projectId,
            featureId,
            environmentId,
            strategyId,
            payload,
        );

        await refetchSavedStrategySegments();
        setToastData({
            text: 'Strategy updated',
            type: 'success',
        });
    };

    const onStrategyRequestEdit = async (payload: IFeatureStrategyPayload) => {
        await addChange(projectId, environmentId, {
            action: 'updateStrategy',
            feature: featureId,
            payload: { ...payload, id: strategyId },
        });
        // FIXME: segments in change requests
        setToastData({
            text: 'Change added to draft',
            type: 'success',
        });
        refetchChangeRequests();
    };

    const onSubmit = async () => {
        try {
            if (isChangeRequestConfigured(environmentId)) {
                await onStrategyRequestEdit(payload);
            } else {
                await onStrategyEdit(payload);
            }
            emitConflictsCreatedEvents();
            refetchFeature();
            navigate(formatFeaturePath(projectId, featureId));
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    if (!strategy.id || !strategyDefinition) {
        return null;
    }

    if (!data) return null;

    return (
        <FormTemplate
            modal
            disablePadding
            description={featureStrategyHelp}
            documentationLink={featureStrategyDocsLink}
            documentationLinkLabel={featureStrategyDocsLinkLabel}
            formatApiCode={() =>
                formatUpdateStrategyApiCode(
                    projectId,
                    featureId,
                    environmentId,
                    strategyId,
                    payload,
                    strategyDefinition,
                    unleashUrl,
                )
            }
        >
            <LegacyFeatureStrategyForm
                feature={data}
                strategy={strategy}
                setStrategy={setStrategy}
                segments={segments}
                setSegments={setSegments}
                environmentId={environmentId}
                onSubmit={onSubmit}
                loading={loading}
                permission={UPDATE_FEATURE_STRATEGY}
                errors={errors}
                isChangeRequest={isChangeRequestConfigured(environmentId)}
                tab={tab}
                setTab={setTab}
                StrategyVariants={
                    <NewStrategyVariants
                        strategy={strategy}
                        setStrategy={setStrategy}
                    />
                }
            />
            {staleDataNotification}
        </FormTemplate>
    );
};

const NewFeatureStrategyEdit = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const environmentId = useRequiredQueryParam('environmentId');
    const strategyId = useRequiredQueryParam('strategyId');

    const [strategy, setStrategy] = useState<Partial<IFeatureStrategy>>({});
    const { updateStrategyOnFeature, loading } = useFeatureStrategyApi();
    const { strategyDefinition } = useStrategy(strategy.name);
    const { defaultStickiness } = useDefaultProjectSettings(projectId);
    const { setToastData, setToastApiError } = useToast();
    const errors = useFormErrors();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const navigate = useNavigate();
    const { addChange } = useChangeRequestApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { refetch: refetchChangeRequests, data: pendingChangeRequests } =
        usePendingChangeRequests(projectId);
    const { setPreviousTitle } = useTitleTracking();

    const { feature, refetchFeature } = useFeature(projectId, featureId);

    const ref = useRef<IFeatureToggle>(feature);

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
    }, [feature]);

    const { trackEvent } = usePlausibleTracker();
    const { changeRequests: scheduledChangeRequestThatUseStrategy } =
        useScheduledChangeRequestsWithStrategy(projectId, strategyId);

    const pendingCrsUsingThisStrategy = getChangeRequestConflictCreatedData(
        pendingChangeRequests,
        featureId,
        strategyId,
        uiConfig,
    );

    const scheduledCrsUsingThisStrategy =
        getChangeRequestConflictCreatedDataFromScheduleData(
            scheduledChangeRequestThatUseStrategy,
            uiConfig,
        );

    const emitConflictsCreatedEvents = (): void =>
        [
            ...pendingCrsUsingThisStrategy,
            ...scheduledCrsUsingThisStrategy,
        ].forEach((data) => {
            trackEvent('change_request', {
                props: {
                    ...data,
                    action: 'edit-strategy',
                    eventType: 'conflict-created',
                },
            });
        });

    useEffect(() => {
        const savedStrategy = data?.environments
            .flatMap((environment) => environment.strategies)
            .find((strategy) => strategy.id === strategyId);

        const constraintsWithId = addIdSymbolToConstraints(savedStrategy);

        const formattedStrategy = {
            ...savedStrategy,
            constraints: constraintsWithId,
        };

        setStrategy((prev) => ({ ...prev, ...formattedStrategy }));
        setPreviousTitle(savedStrategy?.title || '');
    }, [strategyId, data]);

    useEffect(() => {
        if (!strategyDefinition) {
            return;
        }

        const defaultParameters = createFeatureStrategy(
            featureId,
            strategyDefinition,
            defaultStickiness,
        ).parameters;

        setStrategy((prev) => {
            return {
                ...prev,
                parameters: {
                    ...defaultParameters,
                    ...prev.parameters,
                },
            };
        });
    }, [defaultStickiness, strategyDefinition?.name]);

    const payload = createStrategyPayload(strategy);

    const onStrategyEdit = async (payload: IFeatureStrategyPayload) => {
        await updateStrategyOnFeature(
            projectId,
            featureId,
            environmentId,
            strategyId,
            payload,
        );

        setToastData({
            text: 'Strategy updated',
            type: 'success',
        });
    };

    const onStrategyRequestEdit = async (payload: IFeatureStrategyPayload) => {
        await addChange(projectId, environmentId, {
            action: 'updateStrategy',
            feature: featureId,
            payload: { ...payload, id: strategyId },
        });
        setToastData({
            text: 'Change added to draft',
            type: 'success',
        });
        refetchChangeRequests();
    };

    const onSubmit = async () => {
        try {
            if (isChangeRequestConfigured(environmentId)) {
                await onStrategyRequestEdit(payload);
            } else {
                await onStrategyEdit(payload);
            }
            emitConflictsCreatedEvents();
            refetchFeature();
            navigate(formatFeaturePath(projectId, featureId));
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    if (!strategy.id || !strategyDefinition) {
        return null;
    }

    if (!data) return null;

    return (
        <FormTemplate
            modal
            disablePadding
            description={featureStrategyHelp}
            documentationLink={featureStrategyDocsLink}
            documentationLinkLabel={featureStrategyDocsLinkLabel}
            formatApiCode={() =>
                formatUpdateStrategyApiCode(
                    projectId,
                    featureId,
                    environmentId,
                    strategyId,
                    payload,
                    strategyDefinition,
                    unleashUrl,
                )
            }
        >
            <FeatureStrategyForm
                feature={data}
                strategy={strategy}
                setStrategy={setStrategy}
                environmentId={environmentId}
                onSubmit={onSubmit}
                loading={loading}
                permission={UPDATE_FEATURE_STRATEGY}
                errors={errors}
                isChangeRequest={isChangeRequestConfigured(environmentId)}
                StrategyVariants={
                    <NewStrategyVariants
                        strategy={strategy}
                        setStrategy={setStrategy}
                    />
                }
            />
            {staleDataNotification}
        </FormTemplate>
    );
};

const ExportedFeatureStrategyEdit = () => {
    const consolidate = useUiFlag('strategyFormConsolidation');
    return consolidate ? (
        <NewFeatureStrategyEdit />
    ) : (
        <LegacyFeatureStrategyEdit />
    );
};
export { ExportedFeatureStrategyEdit as FeatureStrategyEdit };

export const createStrategyPayload = (
    strategy: Partial<IFeatureStrategy>,
): IFeatureStrategyPayload => ({
    name: strategy.name,
    title: strategy.title,
    constraints: strategy.constraints ?? [],
    parameters: strategy.parameters ?? {},
    variants: strategy.variants ?? [],
    segments: strategy.segments ?? [],
    disabled: strategy.disabled ?? false,
});

export const legacyCreateStrategyPayload = (
    strategy: Partial<IFeatureStrategy>,
    segments: ISegment[],
): IFeatureStrategyPayload => ({
    name: strategy.name,
    title: strategy.title,
    constraints: strategy.constraints ?? [],
    parameters: strategy.parameters ?? {},
    variants: strategy.variants ?? [],
    segments: segments.map((segment) => segment.id),
    disabled: strategy.disabled ?? false,
});

export const formatFeaturePath = (
    projectId: string,
    featureId: string,
): string => {
    return `/projects/${projectId}/features/${featureId}`;
};

export const formatEditStrategyPath = (
    projectId: string,
    featureId: string,
    environmentId: string,
    strategyId: string,
): string => {
    const params = new URLSearchParams({ environmentId, strategyId });

    return `/projects/${projectId}/features/${featureId}/strategies/edit?${params}`;
};

export const formatUpdateStrategyApiCode = (
    projectId: string,
    featureId: string,
    environmentId: string,
    strategyId: string,
    strategy: Partial<IFeatureStrategy>,
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

    const url = `${unleashUrl}/api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/${strategyId}`;
    const payload = JSON.stringify(
        sortedStrategy,
        apiPayloadConstraintReplacer,
        2,
    );

    return `curl --location --request PUT '${url}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${payload}'`;
};

export const featureStrategyHelp = `
    An activation strategy will only run when a feature flag is enabled and provides a way to control who will get access to the feature.
    If any of a feature flag's activation strategies returns true, the user will get access.
`;

export const featureStrategyDocsLink =
    'https://docs.getunleash.io/concepts/activation-strategies';

export const featureStrategyDocsLinkLabel = 'Strategies documentation';
