import React, { FC, useState } from 'react';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useNavigate } from 'react-router-dom';
import useToast from 'hooks/useToast';
import { formatFeaturePath } from '../FeatureStrategyEdit/FeatureStrategyEdit';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { Alert, styled, Typography } from '@mui/material';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { DELETE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { STRATEGY_FORM_REMOVE_ID } from 'utils/testIds';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { Delete } from '@mui/icons-material';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import { useChangeRequestApi } from '../../../../hooks/api/actions/useChangeRequestApi/useChangeRequestApi';

interface IFeatureStrategyRemoveProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategyId: string;
    disabled?: boolean;
    icon?: boolean;
}

interface FeatureStrategyRemoveDialogueProps {
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

const FeatureStrategyRemoveDialogue: FC<FeatureStrategyRemoveDialogueProps> = ({
    onRemove,
    onClose,
    isOpen,
}) => {
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
    FeatureStrategyRemoveDialogueProps
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

export const FeatureStrategyRemove = ({
    projectId,
    featureId,
    environmentId,
    strategyId,
    disabled,
    icon,
}: IFeatureStrategyRemoveProps) => {
    const [openDialogue, setOpenDialogue] = useState(false);
    const { deleteStrategyFromFeature } = useFeatureStrategyApi();
    const { addChangeRequest } = useChangeRequestApi();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const { uiConfig } = useUiConfig();
    const suggestChangesEnabled = Boolean(uiConfig?.flags?.changeRequests);

    const onSuggestRemove = async (event: React.FormEvent) => {
        try {
            event.preventDefault();
            await addChangeRequest(projectId, environmentId, {
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
            setOpenDialogue(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };
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

    const onRemoveStrategy = () => {
        setOpenDialogue(true);
    };

    return (
        <>
            <ConditionallyRender
                condition={Boolean(icon)}
                show={
                    <PermissionIconButton
                        onClick={onRemoveStrategy}
                        projectId={projectId}
                        environmentId={environmentId}
                        disabled={disabled}
                        permission={DELETE_FEATURE_STRATEGY}
                        data-testid={STRATEGY_FORM_REMOVE_ID}
                        tooltipProps={{ title: 'Remove strategy' }}
                        type="button"
                    >
                        <Delete />
                    </PermissionIconButton>
                }
                elseShow={
                    <PermissionButton
                        onClick={() => setOpenDialogue(true)}
                        projectId={projectId}
                        environmentId={environmentId}
                        disabled={disabled}
                        permission={DELETE_FEATURE_STRATEGY}
                        data-testid={STRATEGY_FORM_REMOVE_ID}
                        color="secondary"
                        variant="text"
                        type="button"
                    >
                        Remove strategy
                    </PermissionButton>
                }
            />
            <ConditionallyRender
                condition={suggestChangesEnabled}
                show={
                    <SuggestFeatureStrategyRemoveDialogue
                        isOpen={openDialogue}
                        onClose={() => setOpenDialogue(false)}
                        onRemove={onSuggestRemove}
                    />
                }
                elseShow={
                    <FeatureStrategyRemoveDialogue
                        isOpen={openDialogue}
                        onClose={() => setOpenDialogue(false)}
                        onRemove={onRemove}
                    />
                }
            />
        </>
    );
};
