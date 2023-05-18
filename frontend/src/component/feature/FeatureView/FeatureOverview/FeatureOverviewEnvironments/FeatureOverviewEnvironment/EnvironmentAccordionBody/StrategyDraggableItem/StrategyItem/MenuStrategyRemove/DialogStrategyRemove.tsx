import React, { FC } from 'react';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useNavigate } from 'react-router-dom';
import useToast from 'hooks/useToast';
import { formatFeaturePath } from '../../../../../../../../FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { Alert, styled, Typography } from '@mui/material';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';

interface IFeatureStrategyRemoveProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategyId: string;
    disabled?: boolean;
    icon?: boolean;
    text?: boolean;
}

interface IFeatureStrategyRemoveDialogueProps {
    onRemove: (event: React.FormEvent) => Promise<void>;
    onClose: () => void;
    isOpen: boolean;
}

const RemoveAlert: FC = () => (
    <Alert severity="error">
        Removing the strategy will change which users receive access to the
        feature.
    </Alert>
);

const FeatureStrategyRemoveDialogue: FC<
    IFeatureStrategyRemoveDialogueProps
> = ({ onRemove, onClose, isOpen }) => {
    return (
        <Dialogue
            title="Are you sure you want to delete this strategy?"
            open={isOpen}
            primaryButtonText="Remove strategy"
            secondaryButtonText="Cancel"
            onClick={onRemove}
            onClose={onClose}
        >
            <RemoveAlert />
        </Dialogue>
    );
};

const MsgContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
}));

const SuggestFeatureStrategyRemoveDialogue: FC<
    IFeatureStrategyRemoveDialogueProps
> = ({ onRemove, onClose, isOpen }) => {
    return (
        <Dialogue
            title="Suggest changes"
            open={isOpen}
            primaryButtonText="Add suggestion to draft"
            secondaryButtonText="Cancel"
            onClick={onRemove}
            onClose={onClose}
        >
            <RemoveAlert />
            <MsgContainer>
                <Typography variant="body2" color="text.secondary">
                    Your suggestion:
                </Typography>
            </MsgContainer>
            <Typography fontWeight="bold">Remove strategy</Typography>
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
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const { refetchFeature } = useFeature(projectId, featureId);

    const onRemove = async (event: React.FormEvent) => {
        try {
            event.preventDefault();
            await deleteStrategyFromFeature(
                projectId,
                featureId,
                environmentId,
                strategyId
            );
            setToastData({
                title: 'Strategy deleted',
                type: 'success',
            });
            refetchFeature();
            navigate(formatFeaturePath(projectId, featureId));
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
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
    const { setToastData, setToastApiError } = useToast();
    const onSuggestRemove = async (event: React.FormEvent) => {
        try {
            event.preventDefault();
            await addChange(projectId, environmentId, {
                action: 'deleteStrategy',
                feature: featureId,
                payload: {
                    id: strategyId,
                },
            });
            setToastData({
                title: 'Changes added to the draft!',
                type: 'success',
            });
            await refetchChangeRequests();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };
    return onSuggestRemove;
};

export const DialogStrategyRemove = ({
    projectId,
    featureId,
    environmentId,
    strategyId,
    text,
    isOpen,
    onClose,
}: IFeatureStrategyRemoveProps & {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const onRemove = useOnRemove({
        featureId,
        projectId,
        strategyId,
        environmentId,
    });
    const onSuggestRemove = useOnSuggestRemove({
        featureId,
        projectId,
        strategyId,
        environmentId,
    });

    if (isChangeRequestConfigured(environmentId)) {
        return (
            <SuggestFeatureStrategyRemoveDialogue
                isOpen={isOpen}
                onClose={() => onClose()}
                onRemove={async e => {
                    await onSuggestRemove(e);
                    onClose();
                }}
            />
        );
    }

    return (
        <FeatureStrategyRemoveDialogue
            isOpen={isOpen}
            onClose={() => onClose()}
            onRemove={onRemove}
        />
    );
};
