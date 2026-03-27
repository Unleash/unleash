import type { FC, ReactNode } from 'react';
import {
    isClosed,
    type ChangeRequestState,
    type IChangeRequestChangeFeatureEnvSafeguard,
    type IChangeRequestDeleteFeatureEnvSafeguard,
} from 'component/changeRequest/changeRequest.types';
import type { CreateSafeguardSchema } from 'openapi';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError.ts';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import {
    SafeguardChangeView,
    SafeguardDeleteView,
} from './SafeguardChangeViews.tsx';

const ChangeFeatureEnvSafeguard: FC<{
    change: IChangeRequestChangeFeatureEnvSafeguard;
    changeRequestState: ChangeRequestState;
    environmentName: string;
    featureName: string;
    projectId: string;
    actions?: ReactNode;
    onSubmit: (data: CreateSafeguardSchema) => void;
    onDelete: (safeguardId: string) => void;
}> = ({
    change,
    changeRequestState,
    projectId,
    featureName,
    environmentName,
    ...rest
}) => {
    const { feature } = useFeature(projectId, featureName);
    const liveSafeguard = feature.environments.find(
        (env) => env.name === environmentName,
    )?.safeguards?.[0];
    const currentSafeguard = isClosed(changeRequestState)
        ? (change.payload.snapshot ?? undefined)
        : liveSafeguard;

    if (!change.payload.safeguard) return;

    return (
        <SafeguardChangeView
            safeguard={change.payload.safeguard}
            currentSafeguard={currentSafeguard}
            changeRequestState={changeRequestState}
            environmentName={environmentName}
            featureName={featureName}
            safeguardType='featureEnvironment'
            {...rest}
        />
    );
};

const DeleteFeatureEnvSafeguard: FC<{
    change: IChangeRequestDeleteFeatureEnvSafeguard;
    changeRequestState: ChangeRequestState;
    environmentName: string;
    featureName: string;
    projectId: string;
    actions?: ReactNode;
    onSubmit: (data: CreateSafeguardSchema) => void;
    onDelete: (safeguardId: string) => void;
}> = ({
    change,
    changeRequestState,
    projectId,
    featureName,
    environmentName,
    ...rest
}) => {
    const { feature } = useFeature(projectId, featureName);
    const liveSafeguard = feature.environments.find(
        (env) => env.name === environmentName,
    )?.safeguards?.[0];
    const safeguard = isClosed(changeRequestState)
        ? (change.payload.snapshot ?? undefined)
        : liveSafeguard;

    if (!safeguard) return;

    return (
        <SafeguardDeleteView
            safeguard={safeguard}
            changeRequestState={changeRequestState}
            environmentName={environmentName}
            featureName={featureName}
            safeguardType='featureEnvironment'
            {...rest}
        />
    );
};

export const FeatureEnvSafeguardChange: FC<{
    actions?: ReactNode;
    change:
        | IChangeRequestChangeFeatureEnvSafeguard
        | IChangeRequestDeleteFeatureEnvSafeguard;
    environmentName: string;
    featureName: string;
    projectId: string;
    changeRequestState: ChangeRequestState;
    onRefetch?: () => void;
}> = ({
    actions,
    change,
    featureName,
    environmentName,
    projectId,
    changeRequestState,
    onRefetch,
}) => {
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { setToastData, setToastApiError } = useToast();

    const changeSafeguardSubmit = async (data: CreateSafeguardSchema) => {
        try {
            await addChange(projectId, environmentName, {
                feature: featureName,
                action: 'changeFeatureEnvSafeguard' as const,
                payload: {
                    safeguard: data,
                },
            });
            await refetchChangeRequests();
            setToastData({
                type: 'success',
                text: 'Added to draft',
            });
            onRefetch?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const deleteSafeguardSubmit = async (safeguardId: string) => {
        try {
            await addChange(projectId, environmentName, {
                feature: featureName,
                action: 'deleteFeatureEnvSafeguard',
                payload: {
                    safeguardId,
                },
            });
            await refetchChangeRequests();
            setToastData({
                type: 'success',
                text: 'Added to draft',
            });
            onRefetch?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            {change.action === 'changeFeatureEnvSafeguard' && (
                <ChangeFeatureEnvSafeguard
                    change={change}
                    changeRequestState={changeRequestState}
                    environmentName={environmentName}
                    featureName={featureName}
                    projectId={projectId}
                    onSubmit={changeSafeguardSubmit}
                    onDelete={deleteSafeguardSubmit}
                    actions={actions}
                />
            )}
            {change.action === 'deleteFeatureEnvSafeguard' && (
                <DeleteFeatureEnvSafeguard
                    change={change}
                    changeRequestState={changeRequestState}
                    environmentName={environmentName}
                    featureName={featureName}
                    projectId={projectId}
                    onSubmit={changeSafeguardSubmit}
                    onDelete={deleteSafeguardSubmit}
                    actions={actions}
                />
            )}
        </>
    );
};
