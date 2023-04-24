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
import { useSuggestEnableDisable } from './hooks/useSuggestEnableDisable';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureStrategyChangeRequestAlert } from 'component/feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyChangeRequestAlert/FeatureStrategyChangeRequestAlert';

interface IDisableEnableStrategyProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategyId: string;
}

const DisableStrategy: VFC<IDisableEnableStrategyProps> = ({ ...props }) => {
    const { projectId, environmentId } = props;
    const [isDialogueOpen, setDialogueOpen] = useState(false);
    const { onDisable } = useEnableDisable({ ...props });
    const { onSuggestDisable } = useSuggestEnableDisable({ ...props });
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const isChangeRequest = isChangeRequestConfigured(environmentId);

    const onClick = (event: React.FormEvent) => {
        console.log('click', { isChangeRequest });
        event.preventDefault();
        if (isChangeRequest) {
            onSuggestDisable();
        } else {
            onDisable();
        }
        setDialogueOpen(false);
    };

    return (
        <>
            <PermissionIconButton
                onClick={() => setDialogueOpen(true)}
                projectId={projectId}
                environmentId={environmentId}
                permission={DELETE_FEATURE_STRATEGY}
                tooltipProps={{
                    title: isChangeRequest
                        ? 'Add to draft'
                        : 'Disable strategy',
                }}
                type="button"
            >
                <BlockIcon />
            </PermissionIconButton>
            <Dialogue
                title={
                    isChangeRequest
                        ? 'Add disabling strategy to change request?'
                        : 'Are you sure you want to disable this strategy?'
                }
                open={isDialogueOpen}
                primaryButtonText={
                    isChangeRequest ? 'Add to draft' : 'Disable strategy'
                }
                secondaryButtonText="Cancel"
                onClick={onClick}
                onClose={() => setDialogueOpen(false)}
            >
                <ConditionallyRender
                    condition={isChangeRequest}
                    show={
                        <FeatureStrategyChangeRequestAlert
                            environment={environmentId}
                        />
                    }
                    elseShow={
                        <Alert severity="error">
                            Disabling the strategy will change which users
                            receive access to the feature.
                        </Alert>
                    }
                />
            </Dialogue>
        </>
    );
};

const EnableStrategy: VFC<IDisableEnableStrategyProps> = ({ ...props }) => {
    const { projectId, environmentId } = props;
    const [isDialogueOpen, setDialogueOpen] = useState(false);
    const { onEnable } = useEnableDisable({ ...props });
    const { onSuggestEnable } = useSuggestEnableDisable({ ...props });
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const isChangeRequest = isChangeRequestConfigured(environmentId);

    const onClick = (event: React.FormEvent) => {
        console.log('click', { isChangeRequest });
        event.preventDefault();
        if (isChangeRequest) {
            onSuggestEnable();
        } else {
            onEnable();
        }
        setDialogueOpen(false);
    };

    return (
        <>
            <PermissionIconButton
                onClick={() => setDialogueOpen(true)}
                projectId={projectId}
                environmentId={environmentId}
                permission={CREATE_FEATURE_STRATEGY}
                tooltipProps={{
                    title: isChangeRequest ? 'Add to draft' : 'Enable strategy',
                }}
                type="button"
            >
                <TrackChangesIcon />
            </PermissionIconButton>
            <Dialogue
                title={
                    isChangeRequest
                        ? 'Add enabling strategy to change request?'
                        : 'Are you sure you want to enable this strategy?'
                }
                open={isDialogueOpen}
                primaryButtonText={
                    isChangeRequest ? 'Add to draft' : 'Enable strategy'
                }
                secondaryButtonText="Cancel"
                onClick={onClick}
                onClose={() => setDialogueOpen(false)}
            >
                <ConditionallyRender
                    condition={isChangeRequest}
                    show={
                        <FeatureStrategyChangeRequestAlert
                            environment={environmentId}
                        />
                    }
                    elseShow={
                        <Alert severity="error">
                            Enabling the strategy will change which users
                            receive access to the feature.
                        </Alert>
                    }
                />
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
