import { useEffect, useRef, useState } from 'react';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import type { ISegment } from 'interfaces/segment';
import { useFormErrors } from 'hooks/useFormErrors';
import { useCollaborateData } from 'hooks/useCollaborateData';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { comparisonModerator } from 'component/feature/FeatureStrategy/featureStrategy.utils';
import type {
    ChangeRequestAddStrategy,
    ChangeRequestEditStrategy,
    IChangeRequestAddStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { FeatureStrategyForm } from '../../../../feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyForm.tsx';
import { LegacyFeatureStrategyForm } from '../../../../feature/FeatureStrategy/FeatureStrategyForm/LegacyFeatureStrategyForm.tsx';
import { NewStrategyVariants } from 'component/feature/StrategyTypes/NewStrategyVariants';
import { constraintId } from 'constants/constraintId.ts';
import { apiPayloadConstraintReplacer } from 'utils/api-payload-constraint-replacer.ts';
import { useUiFlag } from 'hooks/useUiFlag.ts';

interface IEditChangeProps {
    change: IChangeRequestAddStrategy | IChangeRequestUpdateStrategy;
    changeRequestId: number;
    featureId: string;
    environment: string;
    open: boolean;
    onSubmit: () => void;
    onClose: () => void;
}

const addIdSymbolToConstraints = (
    strategy?: ChangeRequestAddStrategy | ChangeRequestEditStrategy,
) => {
    if (!strategy) return;

    return strategy?.constraints.map((constraint) => {
        return { ...constraint, [constraintId]: crypto.randomUUID() };
    });
};

const LegacyEditChange = ({
    change,
    changeRequestId,
    environment,
    open,
    onSubmit,
    onClose,
    featureId,
}: IEditChangeProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { editChange } = useChangeRequestApi();
    const [tab, setTab] = useState(0);

    const constraintsWithId = addIdSymbolToConstraints(change.payload);

    const [strategy, setStrategy] = useState<Partial<IFeatureStrategy>>({
        ...change.payload,
        constraints: constraintsWithId,
    });

    const { segments: allSegments } = useSegments();
    const strategySegments = (allSegments || []).filter((segment) => {
        return change.payload.segments?.includes(segment.id);
    });

    const [segments, setSegments] = useState<ISegment[]>(strategySegments);

    const strategyDefinition = {
        parameters: change.payload.parameters,
        name: change.payload.name,
    };
    const { setToastData, setToastApiError } = useToast();
    const errors = useFormErrors();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

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

    const payload = {
        ...strategy,
        segments: segments.map((segment) => segment.id),
    };

    const onInternalSubmit = async () => {
        try {
            await editChange(projectId, changeRequestId, change.id, {
                action: strategy.id ? 'updateStrategy' : 'addStrategy',
                feature: featureId,
                payload,
            });
            onSubmit();
            setToastData({
                text: 'Change updated',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    if (!strategyDefinition) {
        return null;
    }

    if (!data) return null;

    return (
        <SidebarModal
            open={open}
            onClose={onClose}
            label='Edit change'
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <FormTemplate
                modal
                disablePadding
                description={featureStrategyHelp}
                documentationLink={featureStrategyDocsLink}
                documentationLinkLabel={featureStrategyDocsLinkLabel}
                formatApiCode={() =>
                    formatUpdateStrategyApiCode(
                        projectId,
                        changeRequestId,
                        change.id,
                        payload,
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
                    environmentId={environment}
                    onSubmit={onInternalSubmit}
                    onCancel={onClose}
                    loading={false}
                    permission={UPDATE_FEATURE_STRATEGY}
                    errors={errors}
                    isChangeRequest={isChangeRequestConfigured(environment)}
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
        </SidebarModal>
    );
};

const NewEditChange = ({
    change,
    changeRequestId,
    environment,
    open,
    onSubmit,
    onClose,
    featureId,
}: IEditChangeProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { editChange } = useChangeRequestApi();

    const constraintsWithId = addIdSymbolToConstraints(change.payload);

    const [strategy, setStrategy] = useState<Partial<IFeatureStrategy>>({
        ...change.payload,
        constraints: constraintsWithId,
    });

    const { setToastData, setToastApiError } = useToast();
    const errors = useFormErrors();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

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

    const onInternalSubmit = async () => {
        try {
            await editChange(projectId, changeRequestId, change.id, {
                action: strategy.id ? 'updateStrategy' : 'addStrategy',
                feature: featureId,
                payload: strategy,
            });
            onSubmit();
            setToastData({
                text: 'Change updated',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    if (!data) return null;

    return (
        <SidebarModal
            open={open}
            onClose={onClose}
            label='Edit change'
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <FormTemplate
                modal
                disablePadding
                description={featureStrategyHelp}
                documentationLink={featureStrategyDocsLink}
                documentationLinkLabel={featureStrategyDocsLinkLabel}
                formatApiCode={() =>
                    formatUpdateStrategyApiCode(
                        projectId,
                        changeRequestId,
                        change.id,
                        strategy,
                        unleashUrl,
                    )
                }
            >
                <FeatureStrategyForm
                    feature={data}
                    strategy={strategy}
                    setStrategy={setStrategy}
                    environmentId={environment}
                    onSubmit={onInternalSubmit}
                    onCancel={onClose}
                    loading={false}
                    permission={UPDATE_FEATURE_STRATEGY}
                    errors={errors}
                    isChangeRequest={isChangeRequestConfigured(environment)}
                    StrategyVariants={
                        <NewStrategyVariants
                            strategy={strategy}
                            setStrategy={setStrategy}
                        />
                    }
                />

                {staleDataNotification}
            </FormTemplate>
        </SidebarModal>
    );
};

export const EditChange = (props: IEditChangeProps) => {
    const consolidate = useUiFlag('strategyFormConsolidation');
    return consolidate ? (
        <NewEditChange {...props} />
    ) : (
        <LegacyEditChange {...props} />
    );
};

export const formatUpdateStrategyApiCode = (
    projectId: string,
    changeRequestId: number,
    changeId: number,
    strategy: Partial<IFeatureStrategy>,
    unleashUrl?: string,
): string => {
    if (!unleashUrl) {
        return '';
    }

    const url = `${unleashUrl}/api/admin/projects/${projectId}/change-requests/${changeRequestId}/changes/${changeId}`;
    const payload = JSON.stringify(strategy, apiPayloadConstraintReplacer, 2);

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
