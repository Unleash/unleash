import { Alert } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useEnableDisable } from './hooks/useEnableDisable.ts';
import { useSuggestEnableDisable } from './hooks/useSuggestEnableDisable.ts';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureStrategyChangeRequestAlert } from 'component/feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyChangeRequestAlert/FeatureStrategyChangeRequestAlert';
import type { IDisableEnableStrategyProps } from './IDisableEnableStrategyProps.tsx';
import { strategyToggledTracking } from 'component/feature/FeatureStrategy/strategyActionsTracking';
import { strategyShapeProps } from 'component/feature/FeatureStrategy/summarizeStrategy';

export const DisableEnableStrategyDialog = ({
    isOpen,
    onClose,
    ...props
}: IDisableEnableStrategyProps & {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { projectId, environmentId } = props;
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const isChangeRequest = isChangeRequestConfigured(environmentId);
    const { onSuggestEnable, onSuggestDisable } = useSuggestEnableDisable({
        ...props,
    });
    const { onEnable, onDisable } = useEnableDisable({ ...props });
    const { setToastApiError } = useToast();
    const disabled = Boolean(props.strategy.disabled);

    const tracking = {
        ...strategyToggledTracking,
        props: {
            ...strategyShapeProps(props.strategy),
            newState: disabled ? 'enabled' : 'disabled',
            viaChangeRequest: isChangeRequest,
        },
    };

    const toggle = isChangeRequest
        ? disabled
            ? onSuggestEnable
            : onSuggestDisable
        : disabled
          ? onEnable
          : onDisable;

    const onConfirm = async () => {
        await toggle();
        onClose();
    };

    return (
        <Dialogue
            title={
                isChangeRequest
                    ? `Add ${
                          disabled ? 'enable' : 'disable'
                      } strategy to change request?`
                    : `Are you sure you want to ${
                          disabled ? 'enable' : 'disable'
                      } this strategy?`
            }
            open={isOpen}
            primaryButtonText={
                isChangeRequest
                    ? 'Add to draft'
                    : `${disabled ? 'Enable' : 'Disable'} strategy`
            }
            secondaryButtonText='Cancel'
            onSubmit={onConfirm}
            onError={(error) => setToastApiError(formatUnknownError(error))}
            onClose={() => onClose()}
            tracking={tracking}
        >
            <ConditionallyRender
                condition={isChangeRequest}
                show={
                    <FeatureStrategyChangeRequestAlert
                        environment={environmentId}
                    />
                }
                elseShow={
                    <Alert severity='error'>
                        {disabled ? 'Enabling' : 'Disabling'} the strategy will
                        change which users receive access to the feature.
                    </Alert>
                }
            />
        </Dialogue>
    );
};
