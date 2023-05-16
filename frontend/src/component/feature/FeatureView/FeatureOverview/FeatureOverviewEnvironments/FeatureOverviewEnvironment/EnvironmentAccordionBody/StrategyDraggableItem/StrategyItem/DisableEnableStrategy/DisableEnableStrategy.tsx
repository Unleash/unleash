import { VFC, useState } from 'react';
import { Alert, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE_STRATEGY } from '@server/types/permissions';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useEnableDisable } from './hooks/useEnableDisable';
import { useSuggestEnableDisable } from './hooks/useSuggestEnableDisable';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureStrategyChangeRequestAlert } from 'component/feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyChangeRequestAlert/FeatureStrategyChangeRequestAlert';
import { IDisableEnableStrategyProps } from './IDisableEnableStrategyProps';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';

const DisableStrategy: VFC<IDisableEnableStrategyProps> = ({ ...props }) => {
    const { projectId, environmentId, featureId } = props;
    const [isDialogueOpen, setDialogueOpen] = useState(false);
    const { onDisable } = useEnableDisable({ ...props });
    const { onSuggestDisable } = useSuggestEnableDisable({ ...props });
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const isChangeRequest = isChangeRequestConfigured(environmentId);
    const { refetchFeature } = useFeature(projectId, featureId);

    const onClick = (event: React.FormEvent) => {
        event.preventDefault();
        if (isChangeRequest) {
            onSuggestDisable();
        } else {
            onDisable();
            refetchFeature();
        }
        setDialogueOpen(false);
    };

    return (
        <>
            <PermissionIconButton
                onClick={() => setDialogueOpen(true)}
                projectId={projectId}
                environmentId={environmentId}
                permission={UPDATE_FEATURE_STRATEGY}
                tooltipProps={{
                    title: 'Disable strategy',
                }}
                type="button"
            >
                <BlockIcon />
                <ConditionallyRender
                    condition={Boolean(props.text)}
                    show={
                        <Typography
                            variant={'body1'}
                            color={'text.secondary'}
                            sx={{ ml: theme => theme.spacing(1) }}
                        >
                            Disable
                        </Typography>
                    }
                />
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
                permission={UPDATE_FEATURE_STRATEGY}
                tooltipProps={{
                    title: 'Enable strategy',
                }}
                type="button"
            >
                <TrackChangesIcon />
                <ConditionallyRender
                    condition={Boolean(props.text)}
                    show={
                        <Typography
                            variant={'body1'}
                            color={'text.secondary'}
                            sx={{ ml: theme => theme.spacing(1) }}
                        >
                            Disable
                        </Typography>
                    }
                />
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

export const DisableEnableStrategy: VFC<IDisableEnableStrategyProps> = ({
    ...props
}) =>
    props.strategy.disabled ? (
        <EnableStrategy {...props} />
    ) : (
        <DisableStrategy {...props} />
    );
