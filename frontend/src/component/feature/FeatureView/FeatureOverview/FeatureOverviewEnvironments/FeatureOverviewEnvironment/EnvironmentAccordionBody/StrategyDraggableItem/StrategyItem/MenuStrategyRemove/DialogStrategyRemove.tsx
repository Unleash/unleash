import type { FC } from 'react';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { Link, useNavigate } from 'react-router';
import useToast from 'hooks/useToast';
import { formatFeaturePath } from '../../../../../../../../FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit.tsx';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { Alert, styled, Typography } from '@mui/material';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useScheduledChangeRequestsWithStrategy } from 'hooks/api/getters/useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy';
import { strategyDeletedTracking } from 'component/feature/FeatureStrategy/strategyActionsTracking';
import { strategyShapeProps } from 'component/feature/FeatureStrategy/summarizeStrategy';
import type { IFeatureStrategy } from 'interfaces/strategy';
import type { Tracking } from 'utils/trackingEvents';
interface IFeatureStrategyRemoveProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategy: IFeatureStrategy;
    disabled?: boolean;
    icon?: boolean;
}

type ChangeRequest = {
    id: number;
    title?: string;
};

type ScheduledChangeRequestData = {
    changeRequests?: ChangeRequest[];
    projectId: string;
};

interface IFeatureStrategyRemoveDialogueProps {
    onRemove: () => Promise<void>;
    onError?: (error: unknown) => void;
    onClose: () => void;
    isOpen: boolean;
    scheduledChangeRequestsForStrategy: ScheduledChangeRequestData;
    tracking: Tracking;
}

const RemoveAlert: FC = () => (
    <Alert severity='error'>
        Removing the strategy will change which users receive access to the
        feature.
    </Alert>
);

const AlertContainer = styled('div')(({ theme }) => ({
    '> * + *': {
        marginTop: theme.spacing(1),
    },
}));

const StrategyInScheduledChangeRequestsWarning: FC<{
    changeRequests?: ChangeRequest[];
    projectId: string;
}> = ({ changeRequests, projectId }) => {
    if (changeRequests && changeRequests.length > 0) {
        return (
            <Alert severity='warning'>
                <p>
                    This strategy is in use by at least one scheduled change
                    request. If you remove it, those change requests can no
                    longer be applied.
                </p>
                <p>
                    The following scheduled change requests use this strategy:
                </p>
                <ul>
                    {changeRequests.map(({ id, title }) => {
                        const text = title ? `#${id} (${title})` : `#${id}`;
                        return (
                            <li key={id}>
                                <Link
                                    to={`/projects/${projectId}/change-requests/${id}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    title={`Change request ${id}`}
                                >
                                    {text}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </Alert>
        );
    } else if (changeRequests === undefined) {
        return (
            <Alert severity='warning'>
                <p>
                    This strategy may be in use by one or more scheduled change
                    requests. If you remove it, those change requests can no
                    longer be applied.
                </p>
            </Alert>
        );
    }

    // all good, we have nothing to show
    return null;
};

const Alerts: FC<{
    scheduledChangeRequestsForStrategy: ScheduledChangeRequestData;
}> = ({ scheduledChangeRequestsForStrategy }) => (
    <AlertContainer>
        <RemoveAlert />
        <StrategyInScheduledChangeRequestsWarning
            projectId={scheduledChangeRequestsForStrategy.projectId}
            changeRequests={scheduledChangeRequestsForStrategy.changeRequests}
        />
    </AlertContainer>
);

export const FeatureStrategyRemoveDialogue: FC<
    IFeatureStrategyRemoveDialogueProps
> = ({
    onRemove,
    onError,
    onClose,
    isOpen,
    scheduledChangeRequestsForStrategy,
    tracking,
}) => {
    return (
        <Dialogue
            title='Are you sure you want to delete this strategy?'
            open={isOpen}
            primaryButtonText='Remove strategy'
            secondaryButtonText='Cancel'
            onSubmit={onRemove}
            onError={onError}
            onClose={onClose}
            tracking={tracking}
        >
            <Alerts
                scheduledChangeRequestsForStrategy={
                    scheduledChangeRequestsForStrategy
                }
            />
        </Dialogue>
    );
};

const MsgContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
}));

export const SuggestFeatureStrategyRemoveDialogue: FC<
    IFeatureStrategyRemoveDialogueProps
> = ({
    onRemove,
    onError,
    onClose,
    isOpen,
    scheduledChangeRequestsForStrategy,
    tracking,
}) => {
    return (
        <Dialogue
            title='Suggest changes'
            open={isOpen}
            primaryButtonText='Add suggestion to draft'
            secondaryButtonText='Cancel'
            onSubmit={onRemove}
            onError={onError}
            onClose={onClose}
            tracking={tracking}
        >
            <Alerts
                scheduledChangeRequestsForStrategy={
                    scheduledChangeRequestsForStrategy
                }
            />
            <MsgContainer>
                <Typography
                    variant='body2'
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    Your suggestion:
                </Typography>
            </MsgContainer>
            <Typography
                sx={{
                    fontWeight: 'bold',
                }}
            >
                Remove strategy
            </Typography>
        </Dialogue>
    );
};

interface IRemoveProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategyId: string;
}

const useOnRemove = ({
    projectId,
    featureId,
    environmentId,
    strategyId,
}: IRemoveProps) => {
    const { deleteStrategyFromFeature } = useFeatureStrategyApi();
    const { setToastData } = useToast();
    const navigate = useNavigate();
    const { refetchFeature } = useFeature(projectId, featureId);

    const onRemove = async () => {
        await deleteStrategyFromFeature(
            projectId,
            featureId,
            environmentId,
            strategyId,
        );
        setToastData({
            text: 'Strategy deleted',
            type: 'success',
        });
        refetchFeature();
        navigate(formatFeaturePath(projectId, featureId));
    };
    return onRemove;
};

const useOnSuggestRemove = ({
    projectId,
    featureId,
    environmentId,
    strategyId,
}: IRemoveProps) => {
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { setToastData } = useToast();
    const onSuggestRemove = async () => {
        await addChange(projectId, environmentId, {
            action: 'deleteStrategy',
            feature: featureId,
            payload: {
                id: strategyId,
            },
        });
        setToastData({
            text: 'Changes added to draft',
            type: 'success',
        });
        await refetchChangeRequests();
    };
    return onSuggestRemove;
};

export const DialogStrategyRemove = ({
    projectId,
    featureId,
    environmentId,
    strategy,
    isOpen,
    onClose,
}: IFeatureStrategyRemoveProps & {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { setToastApiError } = useToast();

    const { changeRequests } = useScheduledChangeRequestsWithStrategy(
        projectId,
        strategy.id,
    );

    const changeRequestData = {
        changeRequests,
        projectId,
    };

    const viaChangeRequest = isChangeRequestConfigured(environmentId);
    const tracking = {
        ...strategyDeletedTracking,
        props: {
            ...strategyShapeProps(strategy),
            viaChangeRequest,
            // Same condition StrategyInScheduledChangeRequestsWarning uses to show the warning.
            scheduledChangeRequestWarningShown:
                changeRequests === undefined || changeRequests.length > 0,
        },
    };
    const onError = (error: unknown) =>
        setToastApiError(formatUnknownError(error));

    const onRemove = useOnRemove({
        featureId,
        projectId,
        environmentId,
        strategyId: strategy.id,
    });
    const onSuggestRemove = useOnSuggestRemove({
        featureId,
        projectId,
        environmentId,
        strategyId: strategy.id,
    });

    if (viaChangeRequest) {
        return (
            <SuggestFeatureStrategyRemoveDialogue
                isOpen={isOpen}
                onClose={() => onClose()}
                onRemove={async () => {
                    await onSuggestRemove();
                    onClose();
                }}
                onError={onError}
                scheduledChangeRequestsForStrategy={changeRequestData}
                tracking={tracking}
            />
        );
    }

    return (
        <FeatureStrategyRemoveDialogue
            isOpen={isOpen}
            onClose={() => onClose()}
            onRemove={onRemove}
            onError={onError}
            scheduledChangeRequestsForStrategy={changeRequestData}
            tracking={tracking}
        />
    );
};
