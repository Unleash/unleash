import { FC } from 'react';
import { Alert, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestInReviewWarning } from 'hooks/useChangeRequestInReviewWarning';

interface IChangeRequestDialogueProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    environment?: string;
    showBanner?: boolean;
    messageComponent: JSX.Element;
}

export const ChangeRequestDialogue: FC<IChangeRequestDialogueProps> = ({
    isOpen,
    onConfirm,
    onClose,
    showBanner,
    environment,
    messageComponent,
}) => {
    const projectId = useRequiredPathParam('projectId');
    const { data } = usePendingChangeRequests(projectId);
    const { changeRequestInReviewOrApproved, alert } =
        useChangeRequestInReviewWarning(data);

    const hasChangeRequestInReviewForEnvironment =
        changeRequestInReviewOrApproved(environment || '');

    const primaryButtonText = hasChangeRequestInReviewForEnvironment
        ? 'Add to existing change request'
        : 'Add suggestion to draft';

    return (
        <Dialogue
            open={isOpen}
            primaryButtonText={primaryButtonText}
            secondaryButtonText="Cancel"
            onClick={onConfirm}
            onClose={onClose}
            title="Request changes"
            fullWidth
        >
            <ConditionallyRender
                condition={hasChangeRequestInReviewForEnvironment}
                show={alert}
            />
            <ConditionallyRender
                condition={Boolean(showBanner)}
                show={
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Change requests feature is enabled for {environment}.
                        Your changes need to be approved before they will be
                        live. All the changes you do now will be added into a
                        draft that you can submit for review.
                    </Alert>
                }
            />

            <Typography variant="body2" color="text.secondary">
                Your suggestion:
            </Typography>
            {messageComponent}
        </Dialogue>
    );
};
