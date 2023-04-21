import { VFC, useState } from 'react';
import { Alert } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import {
    DELETE_FEATURE_STRATEGY,
    CREATE_FEATURE_STRATEGY,
} from '@server/types/permissions';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IDisableEnableStrategyProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategyId: string;
}

const DisableStrategy: VFC<IDisableEnableStrategyProps> = ({
    projectId,
    environmentId,
    featureId,
    strategyId,
}) => {
    const [isDialogueOpen, setDialogueOpen] = useState(false);
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setStrategyDisabledState } = useFeatureStrategyApi();
    const { setToastData, setToastApiError } = useToast();

    const onDisable = async (event: React.FormEvent) => {
        try {
            event.preventDefault();
            setDialogueOpen(false);
            await setStrategyDisabledState(
                projectId,
                featureId,
                environmentId,
                strategyId,
                true
            );
            setToastData({
                title: 'Strategy disabled',
                type: 'success',
            });

            refetchFeature();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <PermissionIconButton
                onClick={() => setDialogueOpen(true)}
                projectId={projectId}
                environmentId={environmentId}
                permission={DELETE_FEATURE_STRATEGY}
                tooltipProps={{ title: 'Disable strategy' }}
                type="button"
            >
                <BlockIcon />
            </PermissionIconButton>
            <Dialogue
                title="Are you sure you want to disable this strategy?"
                open={isDialogueOpen}
                primaryButtonText="Disable strategy"
                secondaryButtonText="Cancel"
                onClick={onDisable}
                onClose={() => setDialogueOpen(false)}
            >
                <Alert severity="error">
                    Disabling the strategy will change which users receive
                    access to the feature.
                </Alert>
            </Dialogue>
        </>
    );
};

const EnableStrategy: VFC<IDisableEnableStrategyProps> = ({
    projectId,
    environmentId,
    featureId,
    strategyId,
}) => {
    const [isDialogueOpen, setDialogueOpen] = useState(false);
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setStrategyDisabledState } = useFeatureStrategyApi();
    const { setToastData, setToastApiError } = useToast();

    const onEnable = async (event: React.FormEvent) => {
        try {
            event.preventDefault();
            setDialogueOpen(false);
            await setStrategyDisabledState(
                projectId,
                featureId,
                environmentId,
                strategyId,
                false
            );
            setToastData({
                title: 'Strategy enabled',
                type: 'success',
            });

            refetchFeature();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <PermissionIconButton
                onClick={() => setDialogueOpen(true)}
                projectId={projectId}
                environmentId={environmentId}
                permission={CREATE_FEATURE_STRATEGY}
                tooltipProps={{ title: 'Enable strategy' }}
                type="button"
            >
                <TrackChangesIcon />
            </PermissionIconButton>
            <Dialogue
                title="Are you sure you want to enable this strategy?"
                open={isDialogueOpen}
                primaryButtonText="Enable strategy"
                secondaryButtonText="Cancel"
                onClick={onEnable}
                onClose={() => setDialogueOpen(false)}
            >
                Enabling the strategy will change which users receive access to
                the feature.
            </Dialogue>
        </>
    );
};

export const DisableEnableStrategy: VFC<
    IDisableEnableStrategyProps & {
        disabled: boolean;
    }
> = ({ disabled, ...props }) =>
    disabled ? <EnableStrategy {...props} /> : <DisableStrategy {...props} />;
