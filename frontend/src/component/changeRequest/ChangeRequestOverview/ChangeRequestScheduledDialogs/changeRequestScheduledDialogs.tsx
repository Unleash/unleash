import { FC } from 'react';
import { APPLY_CHANGE_REQUEST } from '../../../providers/AccessProvider/permissions';
import PermissionButton from '../../../common/PermissionButton/PermissionButton';
import {
    ChangeRequestScheduledDialog,
    ChangeRequestScheduleDialogueProps,
} from './ChangeRequestScheduledDialog';

export const ChangeRequestApplyScheduledDialogue: FC<
    Omit<
        ChangeRequestScheduleDialogueProps,
        'message' | 'title' | 'primaryButtonText' | 'permissionButton'
    > & { projectId: string; environment: string }
> = ({ projectId, environment, disabled, onConfirm, ...rest }) => {
    const message =
        'Applying the changes now means the scheduled time will be ignored';
    const title = 'Apply changes';
    const primaryButtonText = 'Apply changes now';

    return (
        <ChangeRequestScheduledDialog
            message={message}
            title={title}
            primaryButtonText={primaryButtonText}
            onConfirm={onConfirm}
            permissionButton={
                <PermissionButton
                    variant='contained'
                    onClick={() => onConfirm()}
                    projectId={projectId}
                    permission={APPLY_CHANGE_REQUEST}
                    environmentId={environment}
                    disabled={disabled}
                >
                    Apply changes now
                </PermissionButton>
            }
            {...rest}
        />
    );
};

export const ChangeRequestRejectScheduledDialogue: FC<
    Omit<
        ChangeRequestScheduleDialogueProps,
        'message' | 'title' | 'primaryButtonText'
    >
> = ({ ...rest }) => {
    const message =
        'Rejecting the changes now means the scheduled time will be ignored';
    const title = 'Reject changes';
    const primaryButtonText = 'Reject changes';

    return (
        <ChangeRequestScheduledDialog
            message={message}
            title={title}
            primaryButtonText={primaryButtonText}
            {...rest}
        />
    );
};
