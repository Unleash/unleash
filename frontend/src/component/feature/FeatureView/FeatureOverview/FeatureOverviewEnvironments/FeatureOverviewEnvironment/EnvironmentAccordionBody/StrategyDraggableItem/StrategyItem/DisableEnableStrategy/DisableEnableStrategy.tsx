import { VFC, useState } from 'react';
import { Alert } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import {
    DELETE_FEATURE_STRATEGY,
    CREATE_FEATURE_STRATEGY,
} from '@server/types/permissions';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useEnableDisable } from './hooks/useEnableDisable';

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
    const { onDisable } = useEnableDisable({
        projectId,
        environmentId,
        featureId,
        strategyId,
    });

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
                onClick={event => {
                    onDisable(event);
                    setDialogueOpen(false);
                }}
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

    const { onEnable } = useEnableDisable({
        projectId,
        environmentId,
        featureId,
        strategyId,
    });

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
                onClick={event => {
                    onEnable(event);
                    setDialogueOpen(false);
                }}
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
