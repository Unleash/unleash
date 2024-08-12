import { Alert } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useEnableDisable } from './hooks/useEnableDisable';
import { useSuggestEnableDisable } from './hooks/useSuggestEnableDisable';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { FeatureStrategyChangeRequestAlert } from 'component/feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyChangeRequestAlert/FeatureStrategyChangeRequestAlert';
import type { IDisableEnableStrategyProps } from './IDisableEnableStrategyProps';

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
    const disabled = Boolean(props.strategy?.disabled);

    const onClick = (event: React.FormEvent) => {
        event.preventDefault();
        if (isChangeRequest) {
            if (disabled) {
                onSuggestEnable();
            } else {
                onSuggestDisable();
            }
        } else {
            if (disabled) {
                onEnable();
            } else {
                onDisable();
            }
        }
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
            onClick={onClick}
            onClose={() => onClose()}
        >
            {isChangeRequest ? (
                <FeatureStrategyChangeRequestAlert
                    environment={environmentId}
                />
            ) : (
                <Alert severity='error'>
                    {disabled ? 'Enabling' : 'Disabling'} the strategy will
                    change which users receive access to the feature.
                </Alert>
            )}
        </Dialogue>
    );
};
