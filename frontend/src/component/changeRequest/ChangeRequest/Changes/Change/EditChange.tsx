import React, { useEffect, useRef, useState } from 'react';
import { FeatureStrategyForm } from 'component/feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyForm';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useNavigate } from 'react-router-dom';
import useToast from 'hooks/useToast';
import {
    IFeatureStrategy,
    IFeatureStrategyPayload,
    IStrategy,
} from 'interfaces/strategy';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { ISegment } from 'interfaces/segment';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { formatStrategyName } from 'utils/strategyNames';
import { useFormErrors } from 'hooks/useFormErrors';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { sortStrategyParameters } from 'utils/sortStrategyParameters';
import { useCollaborateData } from 'hooks/useCollaborateData';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import {
    IChangeSchema,
    useChangeRequestApi,
} from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { comparisonModerator } from 'component/feature/FeatureStrategy/featureStrategy.utils';
import {
    IChangeRequestAddStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';

interface IEditChangeProps {
    change: IChangeRequestAddStrategy | IChangeRequestUpdateStrategy;
    changeRequestId: number;
    featureId: string;
    environment: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refetch?: () => void;
}

export const EditChange = ({
    change,
    changeRequestId,
    environment,
    open,
    setOpen,
    refetch,
    featureId,
}: IEditChangeProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { editChange } = useChangeRequestApi();

    const [strategy, setStrategy] = useState<Partial<IFeatureStrategy>>(
        change.payload
    );

    const [segments, setSegments] = useState<ISegment[]>(
        change.payload.segments as any as ISegment[]
    );

    const strategyDefinition = {
        parameters: change.payload.parameters,
        name: change.payload.name,
    };
    const { setToastData, setToastApiError } = useToast();
    const errors = useFormErrors();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const navigate = useNavigate();
    const { addChange } = useChangeRequestApi();
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
            comparisonModerator
        );

    useEffect(() => {
        if (ref.current.name === '' && feature.name) {
            forceRefreshCache(feature);
            ref.current = feature;
        }
    }, [feature]);

    // const {
    //     segments: savedStrategySegments,
    //     refetchSegments: refetchSavedStrategySegments,
    // } = useSegments(strategyId);

    // useEffect(() => {
    //     const savedStrategy = data?.environments
    //         .flatMap(environment => environment.strategies)
    //         .find(strategy => strategy.id === strategyId);
    //     setStrategy(prev => ({ ...prev, ...savedStrategy }));
    // }, [strategyId, data]);

    // useEffect(() => {
    //     // Fill in the selected segments once they've been fetched.
    //     savedStrategySegments && setSegments(savedStrategySegments);
    // }, [JSON.stringify(savedStrategySegments)]);

    const onStrategyEdit = async (payload: IFeatureStrategyPayload) => {
        // await updateStrategyOnFeature(
        //     projectId,
        //     featureId,
        //     environmentId,
        //     strategyId,
        //     payload
        // );
        //
        // await refetchSavedStrategySegments();
        // setToastData({
        //     title: 'Strategy updated',
        //     type: 'success',
        //     confetti: true,
        // });
    };

    const onStrategyRequestEdit = async (payload: IFeatureStrategyPayload) => {
        // await addChange(projectId, environmentId, {
        //     action: 'updateStrategy',
        //     feature: featureId,
        //     payload: { ...payload, id: strategyId },
        // });
        // // FIXME: segments in change requests
        // setToastData({
        //     title: 'Change added to draft',
        //     type: 'success',
        //     confetti: true,
        // });
        // refetchChangeRequests();
    };

    const onSubmit = async () => {
        try {
            await editChange(projectId, changeRequestId, change.id, {
                action: 'updateStrategy',
                feature: featureId,
                payload: { ...strategy, segments },
            });
            setOpen(false);
            refetch?.();
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
            onClose={() => {
                console.log('close');
                setOpen(false);
            }}
            label="Edit change"
            onClick={e => {
                e.stopPropagation();
            }}
        >
            <FormTemplate
                modal
                title={formatStrategyName(strategyDefinition.name ?? '')}
                description={featureStrategyHelp}
                documentationLink={featureStrategyDocsLink}
                documentationLinkLabel={featureStrategyDocsLinkLabel}
                formatApiCode={() =>
                    formatUpdateStrategyApiCode(
                        projectId,
                        featureId,
                        environment,
                        strategyDefinition,
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
                    environmentId={environment}
                    onSubmit={onSubmit}
                    loading={false}
                    permission={UPDATE_FEATURE_STRATEGY}
                    errors={errors}
                    isChangeRequest={isChangeRequestConfigured(environment)}
                />
                {staleDataNotification}
            </FormTemplate>
        </SidebarModal>
    );
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

export const formatUpdateStrategyApiCode = (
    projectId: string,
    featureId: string,
    environmentId: string,
    strategy: Partial<IFeatureStrategy>,
    unleashUrl?: string
): string => {
    if (!unleashUrl) {
        return '';
    }

    // // Sort the strategy parameters payload so that they match
    // // the order of the input fields in the form, for usability.
    // const sortedStrategy = {
    //     ...strategy,
    //     parameters: sortStrategyParameters(
    //         strategy.parameters ?? {},
    //         strategyDefinition
    //     ),
    // };

    const url = `${unleashUrl}/api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/${strategy.id}`;
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
    'https://docs.getunleash.io/reference/activation-strategies';

export const featureStrategyDocsLinkLabel = 'Strategies documentation';
